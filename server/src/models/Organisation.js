// Organisation model — top-level tenant entity. Every other document in the
// system is scoped to an organisation. Used by organisation CRUD, middleware
// tenant filtering, and settings-driven features (currency, crop prices,
// quality grades, seasons, deduction rules).
import mongoose from "mongoose";

// Organisations are the top-level tenant boundary. All collections, members,
// loans, and payments are scoped to a single organisation via organisationId.
const organisationSchema = new mongoose.Schema(
  {
    // -- Core identity --
    name: {
      type: String,
      required: [true, "Organisation name is required"],
      trim: true,
    },
    // Short unique code (e.g. "OCDI-001"); sparse so missing values don't collide.
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    logo: {
      type: String,
    },
    // -- Location --
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
    // -- Contact person --
    contactName: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    // Organisation-level configuration that drives how the rest of the system
    // behaves for this tenant: currency used in all displays/reports, per-crop
    // default prices applied when a collection has no explicit price, quality
    // grades and seasons available as dropdown options, and deduction rules
    // (e.g. loan repayment percentage) applied at harvest time.
    settings: {
      currency: { type: String, default: "GHS" },
      defaultCropPrices: { type: Map, of: Number, default: {} },
      qualityGrades: { type: [String], default: ["A", "B", "C"] },
      seasons: { type: [String], default: ["Major", "Minor"] },
      deductionRules: { type: Map, of: Number, default: {} },
    },
    // -- Audit: who created this organisation --
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Organisation = mongoose.model("Organisation", organisationSchema);

export default Organisation;
