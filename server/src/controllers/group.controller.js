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

export const getGroupTree = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate("leaderId", "name role")
      .sort("name")
      .lean();

    const members = await Member.find()
      .select("groupId")
      .lean();

    const tree = buildTree(groups, members);

    res.json({ success: true, count: groups.length, data: tree });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const { hierarchy } = req.query;
    const groups = await Group.find()
      .populate("leaderId", "name role")
      .sort("name");

    if (hierarchy === "true") {
      const withCounts = await Promise.all(
        groups.map(async (g) => ({
          ...g.toObject(),
          memberCount: await Member.countDocuments({ groupId: g._id }),
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

export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "leaderId",
      "name role",
    );
    if (!group) throw new ApiError(404, "Group not found");

    const members = await Member.find({ groupId: group._id })
      .select("firstName lastName phone membershipNumber status photo")
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

export const getUnassignedMembers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {
      $or: [{ groupId: { $exists: false } }, { groupId: null }],
    };
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

export const getGroupMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ groupId: req.params.groupId }).select(
      "firstName lastName phone membershipNumber status photo mainCrops",
    );
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};
