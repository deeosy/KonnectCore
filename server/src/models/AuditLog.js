// AuditLog model — immutable audit trail for all significant actions across
// the system. Written by the logAudit() helper and the audit() Express
// middleware. Indexed by createdAt and organisationId for efficient querying
// in the audit viewer and compliance reports.
import mongoose from "mongoose";
import tenantScope from "./plugins/tenantScope.js";

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    // Verb describing what happened (e.g. create, update, delete, approve,
    // disburse, record, login, assign).
    action: { type: String, required: true },
    // The model/entity that was acted on (e.g. member, group, collection,
    // payment, loan, visit, task, expense, user, organisation, auth).
    resource: { type: String, required: true },
    // The document that was created/changed when applicable.
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    // Human-readable one-liner surfaced in the audit viewer.
    summary: { type: String, default: "" },
    // Structured detail (filtered change set / key fields) for drill-down.
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    // Whether the request ultimately succeeded. Logged after the response so
    // failed requests can be distinguished from successful writes.
    success: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Indexes for common query patterns: reverse-chronological listing, per-org
// listing, and resource-type filtering.
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ organisationId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1 });

// Tenant isolation (see plugin comment for details).
auditLogSchema.plugin(tenantScope);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;