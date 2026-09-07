import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organisation name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    logo: {
      type: String,
    },
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
