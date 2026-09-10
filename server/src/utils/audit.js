import AuditLog from "../models/AuditLog.js";

// Fields that must never land in the audit trail in raw form.
const SENSITIVE_KEYS = ["password", "token", "photo", "photos", "documents"];

const sanitize = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !SENSITIVE_KEYS.includes(String(k).toLowerCase()))
        .map(([k, v]) => [k, sanitize(v)]),
    );
  }
  return value;
};

// Non-fatal by contract: an audit write failure must never break the request
// it is describing.
export async function logAudit({
  user,
  action,
  resource,
  resourceId = null,
  summary = "",
  details = {},
  organisationId,
  success = true,
  req,
}) {
  try {
    await AuditLog.create({
      user: user?._id || user,
      organisationId: organisationId || user?.organisationId || null,
      action,
      resource,
      resourceId,
      summary,
      details: sanitize(details),
      ip: req?.ip || req?.socket?.remoteAddress || "",
      userAgent: (req?.headers?.["user-agent"] || "").slice(0, 300),
      success,
    });
  } catch (error) {
    console.error("Audit log write failed:", error.message);
  }
}

const pickSummary = (body) => {
  const b = body || {};
  const keys = ["name", "firstName", "lastName", "title", "label", "crop", "type", "category"];
  for (const key of keys) {
    if (typeof b[key] === "string" && b[key]) return b[key];
  }
  const parts = [];
  if (b.memberId) parts.push(`member=${b.memberId}`);
  if (b.amount !== undefined && b.amount !== null) parts.push(`amount=${b.amount}`);
  if (b.quantity !== undefined && b.quantity !== null) parts.push(`qty=${b.quantity}`);
  return parts.join(" ");
};

// Express middleware. Wraps res.send so the created/changed document id can be
// captured (most create/update responses return {data:{_id}}), and logs only
// once the response has finished so the success flag reflects the true outcome.
export function audit(action, resource, opts = {}) {
  return (req, res, next) => {
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      res.locals.auditBody = body;
      return originalSend(body);
    };

    res.on("finish", () => {
      let resourceId =
        opts.resourceIdFrom?.(req) ||
        req.params?.id ||
        req.params?.groupId ||
        req.params?.taskId ||
        null;

      if (!resourceId && typeof res.locals.auditBody === "string") {
        try {
          const parsed = JSON.parse(res.locals.auditBody);
          if (parsed?.data?._id) resourceId = parsed.data._id;
        } catch {
          // Non-JSON body (blob downloads etc.) - nothing to extract.
        }
      }

      logAudit({
        user: req.user,
        action,
        resource,
        resourceId,
        organisationId: req.user?.organisationId,
        summary: opts.summary?.(req) || pickSummary(req.body),
        details: opts.details?.(req) || req.body || {},
        success: res.statusCode < 400,
        req,
      });
    });

    return next();
  };
}