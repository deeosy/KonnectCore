// Member model — central entity representing a cooperative member. Used by
// member controllers for registration, profile management, status changes, and
// by collection/payment/loan modules that reference memberId.
import mongoose from "mongoose";
import tenantScope from "./plugins/tenantScope.js";

// Embedded sub-document for member identity documents (ID cards, photos,
// signed agreements). Kept on the member rather than a separate collection so
// document metadata travels with the profile in a single query.
const documentSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    fileName: { type: String },
    filePath: { type: String },
    fileType: { type: String },
    category: {
      type: String,
      enum: ["id_card", "photo", "agreement", "other"],
      default: "other",
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// A member is the central entity in the system. Membership status is stored
// here (not inferred) because a member can exist in the database while being
// suspended or blacklisted — e.g. they may have outstanding loans or
// historical collections that must remain queryable for reporting.
const memberSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    // -- Core identity --
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Auto-generated unique membership number (created in controller).
    membershipNumber: {
      type: String,
      trim: true,
    },
    // -- Identification documents --
    idType: {
      type: String,
      enum: ["national_id", "voter_id", "passport", "other"],
      default: "other",
    },
    idNumber: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
    },
    // -- Location / GPS --
    location: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    gpsLat: {
      type: Number,
    },
    gpsLng: {
      type: Number,
    },
    // -- Farming profile (summary) --
    farmSize: {
      type: Number,
    },
    mainCrops: {
      type: [String],
      default: [],
    },
    // -- References / hierarchy --
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // -- Status lifecycle: active -> inactive | suspended | blacklisted --
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "blacklisted"],
      default: "active",
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    // Soft-delete marker. When set (a timestamp), the member is treated as
    // removed: hidden from lists/counts/reports but the document — and the
    // financial/visit records referencing it — are retained so nothing is
    // orphaned. Set via DELETE /api/members/:id and cleared via restore.
    deletedAt: {
      type: Date,
      default: null,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Tenant isolation (see plugin comment for details).
memberSchema.plugin(tenantScope);

const Member = mongoose.model("Member", memberSchema);

export default Member;
