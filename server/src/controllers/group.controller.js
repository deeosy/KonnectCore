// Group hierarchy controller. Manages the organisational tree (organisation >
// region > district > group > community) with parent-type validation,
// tree building, and bulk member assign/remove operations.
import Group from "../models/Group.js";
import Member from "../models/Member.js";
import { ApiError } from "../middleware/error.middleware.js";

const TYPE_ORDER = {
  organisation: 0,
  region: 1,
  district: 2,
  group: 3,
  community: 4,
};

// Which group types may be a parent of a given type. An organisation is the
// only node that can stand alone; everything else nests under a "higher" node.
const ALLOWED_PARENTS = {
  organisation: [],
  region: ["organisation"],
  district: ["organisation", "region"],
  group: ["region", "district", "group"],
  community: ["region", "district", "group", "community"],
};

const assertValidParent = async (type, parentId, ignoreId = null) => {
  if (!parentId) {
    if (type === "organisation") return;
    return; // null parent is allowed for any type (top-level)
  }
  if (ignoreId && String(parentId) === String(ignoreId)) {
    throw new ApiError(400, "A group cannot be its own parent");
  }
  const parent = await Group.findById(parentId);
  if (!parent) throw new ApiError(400, "Parent group not found");
  const allowed = ALLOWED_PARENTS[type] || [];
  if (!allowed.includes(parent.type)) {
    throw new ApiError(
      400,
      `A ${type} cannot be nested under a ${parent.type}. Allowed parent types: ${
        allowed.join(", ") || "none"
      }.`,
    );
  }
};

// Build a tree from the flat list of groups. Node ordering follows the
// hierarchy TYPE_ORDER so that a parent is always rendered before children.
const buildTree = (groups, members) => {
  const byId = new Map();
  const memberCounts = members.reduce((acc, m) => {
    if (m.groupId) {
      const key = String(m.groupId);
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  groups.forEach((g) =>
    byId.set(String(g._id), {
      ...g,
      memberCount: memberCounts[String(g._id)] || 0,
      children: [],
    }),
  );

  const roots = [];
  groups.forEach((g) => {
    const node = byId.get(String(g._id));
    const parent = g.parentId ? byId.get(String(g.parentId)) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes) => {
    nodes.sort(
      (a, b) =>
        (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99) ||
        a.name.localeCompare(b.name),
    );
    nodes.forEach((n) => sortNodes(n.children));
    return nodes;
  };

  return sortNodes(roots);
};

// GET /api/groups/tree
// Returns the full hierarchy as a nested tree. Builds a flat list of groups
// plus member counts, then links each node under its parent via parentId
// (recursive nesting) rather than a database tree query.
export const getGroupTree = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate("leaderId", "name role")
      .sort("name")
      .lean();

    const members = await Member.find({ deletedAt: null })
      .select("groupId")
      .lean();

    const tree = buildTree(groups, members);

    res.json({ success: true, count: groups.length, data: tree });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups
// Flat listing of all groups. With ?hierarchy=true each group gains a
// memberCount; memberCount requires a per-group query, so the flat (non-
// hierarchy) path avoids that cost entirely.
export const getGroups = async (req, res, next) => {
  try {
    const { hierarchy } = req.query;
    const groups = await Group.find()
      .populate("leaderId", "name role")
      .sort("name");

    if (hierarchy === "true") {
      // One extra countDocuments per group, run concurrently — mirrors
      // buildTree's approach but only for the flat response shape.
      const withCounts = await Promise.all(
        groups.map(async (g) => ({
          ...g.toObject(),
          memberCount: await Member.countDocuments({ groupId: g._id, deletedAt: null }),
        })),
      );
      return res.json({
        success: true,
        count: withCounts.length,
        data: withCounts,
      });
    }

    res.json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id
// Fetch a single group with direct members and child groups attached.
export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "leaderId",
      "name role",
    );
    if (!group) throw new ApiError(404, "Group not found");

const members = await Member.find({ groupId: group._id, deletedAt: null })
      .select("firstName lastName phone membershipNumber status location mainCrops photo")
      .populate("assignedOfficerId", "name");

    const children = await Group.find({ parentId: group._id }).select(
      "name type",
    );

    res.json({
      success: true,
      data: {
        ...group.toObject(),
        members,
        memberCount: members.length,
        children,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups
// Creates a group. Validates the requested parent type before insert so an
// invalid nesting (e.g. an organisation under a district) is rejected.
export const createGroup = async (req, res, next) => {
  try {
    await assertValidParent(req.body.type, req.body.parentId);
    const group = await Group.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// PUT /api/groups/:id
// Updates a group's fields. If the type or parentId changes, the new
// parent/type combination is re-validated (ignoring self-references).
export const updateGroup = async (req, res, next) => {
  try {
    const existing = await Group.findById(req.params.id);
    if (!existing) throw new ApiError(404, "Group not found");
    const type = req.body.type || existing.type;
    if (type !== "organisation") {
      await assertValidParent(type, req.body.parentId, req.params.id);
    }
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// Deleting a group first unassigns it from all members. Without this step,
// members would be left pointing at a groupId that no longer exists, breaking
// the member list and group filtering. Note that child groups are NOT deleted
// here — only the target group itself; children remain orphaned at the
// hierarchy level.
export const deleteGroup = async (req, res, next) => {
  try {
    await Member.updateMany(
      { groupId: req.params.id },
      { $unset: { groupId: "" } },
    );
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) throw new ApiError(404, "Group not found");
    res.json({ success: true, message: "Group removed" });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups/:groupId/members
// Bulk-assigns members to a group via a single $in updateMany — any listed
// member's existing groupId is overwritten. Returns the modified count.
export const assignMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");

    if (!Array.isArray(memberIds) || !memberIds.length) {
      throw new ApiError(400, "memberIds array is required");
    }

    const result = await Member.updateMany(
      { _id: { $in: memberIds } },
      { groupId: group._id },
    );

    res.json({
      success: true,
      message: "Members assigned",
      modified: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/groups/:groupId/members
// Bulk-removes members from a group. Unlike assignMembers, the filter scopes
// to members currently in that group so ids from other groups are untouched.
export const removeMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");

    if (!Array.isArray(memberIds) || !memberIds.length) {
      throw new ApiError(400, "memberIds array is required");
    }

    const result = await Member.updateMany(
      { _id: { $in: memberIds }, groupId: group._id },
      { $unset: { groupId: "" } },
    );

    res.json({
      success: true,
      message: "Members removed from group",
      modified: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/unassigned
// Lists members with no group, optionally filtered by an $or search. Note the
// filter juggling: the base $or (no group) is wrapped inside $and when a
// search is present so both constraints apply.
export const getUnassignedMembers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {
      $or: [{ groupId: { $exists: false } }, { groupId: null }],
    };
    // Deleted members never appear in assign/unassigned pickers.
    filter.deletedAt = null;
    if (search) {
      filter.$and = [
        filter.$or,
        {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { membershipNumber: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    const members = await Member.find(filter)
      .select("firstName lastName phone membershipNumber status location mainCrops photo")
      .sort("-createdAt")
      .limit(100);

    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:groupId/members
// Returns a compact member list for a specific group (id fields only).
export const getGroupMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ groupId: req.params.groupId, deletedAt: null }).select(
      "firstName lastName phone membershipNumber status photo mainCrops",
    );
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};
