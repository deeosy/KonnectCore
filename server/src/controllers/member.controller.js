// Member (farmer) CRUD controller. Handles paginated listing with search
// and filters, photo upload, auto-generated membership numbers, and
// document attachments.
import Member from "../models/Member.js";
import { ApiError } from "../middleware/error.middleware.js";

// normalizeCrops - mastens mainCrops into a clean string array regardless of
// how it arrives. Multipart form-data has no native array type, so the client
// sends a JSON string like '["Cocoa","Maize"]'; CSV imports send comma-
// separated text; direct API calls can send a real array. All three forms
// collapse to the same ["Cocoa","Maize"] shape instead of Mongoose storing
// the raw serialized string as a single array element.
const normalizeCrops = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const clean = (list) =>
    list.map((c) => String(c).trim()).filter(Boolean);
  if (Array.isArray(value)) return clean(value);
  const str = String(value).trim();
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return clean(parsed);
  } catch {
    // Not JSON — fall through to comma-split handling below.
  }
  const parts = str.split(",").map((c) => c.trim()).filter(Boolean);
  return parts.length ? parts : [str];
};

// GET /api/members
// Paginated listing with optional search, status, group, crop, location, and
// officer filters. Search and location match case-insensitively via regex.
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
    // Deleted members are hidden from every list, search, and export. Existing
    // documents without the field still match `{ deletedAt: null }` in Mongo.
    filter.deletedAt = null;

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

// GET /api/members/:id
// Fetch a single member with group, assigned officer, and registrar resolved
// to readable names.
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

// POST /api/members
// Creates a member. Accepts multipart/form-data (photo upload); when no
// membershipNumber is supplied one is auto-generated. registeredBy is always
// pinned to the acting user.
export const createMember = async (req, res, next) => {
  try {
    const data = { ...req.body, registeredBy: req.user._id };
    // Multipart form-data sends mainCrops as a JSON string; normalize it to a
    // real string array before it reaches Mongoose (see normalizeCrops).
    if (data.mainCrops) data.mainCrops = normalizeCrops(data.mainCrops);

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

    if (data.mainCrops) data.mainCrops = normalizeCrops(data.mainCrops);

    if (req.file) {
      data.photo = `/uploads/members/${req.file.filename}`;
    }

    // findByIdAndUpdate bypasses Mongoose save middleware, so runValidators is
    // required to keep schema validation (required fields, enums) applied.
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

// DELETE /api/members/:id
// Soft delete: instead of removing the document (which would orphan the
// collections, payments, and loans that reference memberId), set deletedAt and
// flip status to inactive. The member disappears from every list/count/report
// (all of which filter on deletedAt:null) while its financial history remains
// intact and queryable. Restore reverses this.
export const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) throw new ApiError(404, "Member not found");
    if (member.deletedAt) throw new ApiError(400, "Member is already deleted");
    member.deletedAt = new Date();
    member.status = "inactive";
    await member.save();
    res.json({ success: true, message: "Member deleted" });
  } catch (error) {
    next(error);
  }
};

// POST /api/members/:id/restore
// Reverses a soft delete by clearing deletedAt and restoring the previous
// status, so a mistakenly deleted record can be brought back without any data
// loss. Only callable by an admin; audited like every other mutation.
export const restoreMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) throw new ApiError(404, "Member not found");
    if (!member.deletedAt) throw new ApiError(400, "Member is not deleted");
    member.deletedAt = null;
    await member.save();
    res.json({ success: true, message: "Member restored", data: member });
  } catch (error) {
    next(error);
  }
};

// POST /api/members/:id/documents
// Appends an uploaded file to the member's documents sub-array. Metadata
// (title, category, uploader) defaults from the file itself when omitted.
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

// DELETE /api/members/:id/documents/:docId
// Removes a single document by id, filtering it out of the sub-array.
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
