import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { sendCsv } from "../utils/export.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { action, resource, user, from, to } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (user) {
      const matchUsers = await User.find({
        $or: [{ name: { $regex: user, $options: "i" } }, { email: { $regex: user, $options: "i" } }],
      }).distinct("_id");
      filter.user = { $in: matchUsers };
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (req.query.format === "csv") {
      const data = logs.map((l) => ({
        date: l.createdAt,
        user: l.user?.name || l.user?.email || "",
        action: l.action,
        resource: l.resource,
        summary: l.summary,
        ip: l.ip,
        success: l.success ? "yes" : "no",
      }));
      return sendCsv(res, data, "audit-logs.csv", ["date", "user", "action", "resource", "summary", "ip", "success"]);
    }

    res.json({ success: true, count: logs.length, total, page, pages: Math.ceil(total / limit) || 1, data: logs });
  } catch (error) {
    next(error);
  }
};