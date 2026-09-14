// Field visit and task controller. Officers log visits with GPS/photo data,
// manage their own task lists, and view per-officer performance metrics.
import FieldVisit from "../models/FieldVisit.js";
import Member from "../models/Member.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";
import { ApiError } from "../middleware/error.middleware.js";
import { currentOrgId } from "../utils/tenant.js";

// Field officers can only see their own visits — this is enforced here, not
// just in the UI, so an officer cannot query another officer's records via
// the API directly. Managers/admins see all visits (or can filter by officer).
export const getVisits = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.memberId) filter.memberId = req.query.memberId;
    // Field officers are always pinned to their own visits — the query param
    // is ignored for them so they cannot pass someone else's officerId to
    // bypass the scope check. Only leaders can filter by officer.
    if (req.user.role === "fieldOfficer") filter.officerId = req.user._id;
    else if (req.query.officerId) filter.officerId = req.query.officerId;

    const visits = await FieldVisit.find(filter)
      .populate("memberId", "firstName lastName phone membershipNumber photo")
      .populate("officerId", "name")
      .sort("-date");

    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    next(error);
  }
};

// POST /api/visits
// Logs a field visit. officerId is pinned to the acting officer. GPS
// coordinates travel in the body (gpsLat/gpsLng); photos are uploaded as
// multipart files and stored under /uploads/visits.
export const createVisit = async (req, res, next) => {
  try {
    const data = { ...req.body, officerId: req.user._id };
    if (req.file || req.files) {
      const files =
        req.files && req.files.length ? req.files : req.file ? [req.file] : [];
      data.photos = files.map((f) => `/uploads/visits/${f.filename}`);
    }
    const visit = await FieldVisit.create(data);
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

// GET /api/visits/officer/:officerId
// Returns one officer's visits. Admin-only context — the officer-scoped
// route guard lives on the router.
export const getVisitsByOfficer = async (req, res, next) => {
  try {
    const visits = await FieldVisit.find({ officerId: req.params.officerId })
      .populate("memberId", "firstName lastName membershipNumber photo")
      .sort("-date");
    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    next(error);
  }
};

// GET /api/visits/me/members
// The officer's own scoped query: all members assigned to the current user.
export const getMyAssignedMembers = async (req, res, next) => {
  try {
    const members = await Member.find({
      assignedOfficerId: req.user._id,
      deletedAt: null,
    })
      .populate("groupId", "name")
      .sort("-createdAt");
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};

// GET /api/visits/me/tasks
// Officer-scoped task list: only tasks assigned to the acting officer.
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("memberId", "firstName lastName phone membershipNumber")
      .sort("-createdAt");
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/visits/tasks/:taskId/status
// Moves a task between statuses (pending/in-progress/completed).
export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status: req.body.status },
      { new: true },
    );
    if (!task) throw new ApiError(404, "Task not found");
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// POST /api/visits/tasks
// Creates a task for an officer. createdBy is pinned to the acting user —
// there is no automatic task creation on visit creation in this controller.
export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// GET /api/visits/performance
// Aggregates a visit count per officer over the last N days (default 7).
// The officer names are joined back via $lookup on the users collection.
export const getOfficerPerformance = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - (Number(req.query.days) || 7));

    const performance = await FieldVisit.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: "$officerId",
          visits: { $sum: 1 },
        },
      },
      {
        // Pipeline-form $lookup so the joined officer is constrained to the
        // tenant's own users collection (a plain localField/foreignField join
        // would bypass the tenantScope plugin's org filter).
        $lookup: {
          from: "users",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
            { $match: { organisationId: new mongoose.Types.ObjectId(String(currentOrgId())) } },
          ],
          as: "officer",
        },
      },
      { $unwind: "$officer" },
      {
        $project: {
          _id: 1,
          visits: 1,
          name: "$officer.name",
          role: "$officer.role",
        },
      },
    ]);

    res.json({ success: true, since, data: performance });
  } catch (error) {
    next(error);
  }
};
