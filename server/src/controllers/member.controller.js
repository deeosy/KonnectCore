import Member from "../models/Member.js";
import { ApiError } from "../middleware/error.middleware.js";

export const getMembers = async (req, res, next) => {
  try {
    const { search, status, groupId, crop, location, officerId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { membershipNumber: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;
    if (groupId) filter.groupId = groupId;
    if (crop) filter.mainCrops = { $in: [crop] };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (officerId) filter.assignedOfficerId = officerId;

    const skip = (page - 1) * limit;
    const total = await Member.countDocuments(filter);

    const members = await Member.find(filter)
      .populate("groupId", "name")
      .populate("assignedOfficerId", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: members.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("groupId", "name type")
      .populate("assignedOfficerId", "name phone role")
      .populate("registeredBy", "name");
    if (!member) throw new ApiError(404, "Member not found");
    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req, res, next) => {
  try {
    const data = { ...req.body, registeredBy: req.user._id };

    if (req.file) {
      data.photo = `/uploads/members/${req.file.filename}`;
    }

    // Auto-generate a membership number only when the client didn't supply
    // one. The KC- prefix identifies the organisation-agnostic membership
    // number format; the timestamp suffix provides rough uniqueness.
    if (!data.membershipNumber) {
      data.membershipNumber = `KC-${Date.now().toString().slice(-6)}`;
    }

    const member = await Member.create(data);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    let data = { ...req.body };

    if (req.file) {
      data.photo = `/uploads/members/${req.file.filename}`;
    }

    const member = await Member.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!member) throw new ApiError(404, "Member not found");
    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// NOTE: This is a hard delete. Collections, payments, and loans store
// memberId references and will end up with orphaned member references if a
// member is removed. In practice this is acceptable for MVP (reports render
// member fields with a fallback), but a soft-delete or referential check
// would be safer for a production deployment with financial records.
export const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) throw new ApiError(404, "Member not found");
    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    next(error);
  }
};

export const attachDocument = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) throw new ApiError(404, "Member not found");

    if (req.file) {
      member.documents.push({
        title: req.body.title || req.file.originalname,
        fileName: req.file.originalname,
        filePath: `/uploads/documents/${req.file.filename}`,
        fileType: req.file.mimetype,
        category: req.body.category || "other",
        uploadedBy: req.user._id,
      });
      await member.save();
    }

    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

export const removeDocument = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) throw new ApiError(404, "Member not found");

    member.documents = member.documents.filter(
      (d) => d._id.toString() !== req.params.docId,
    );
    await member.save();
    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};
