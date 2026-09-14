// Collection model — records a single produce delivery from a member. Used by
// collection controllers, feeds into Payment produce_payment totals, and is
// referenced by Batch for grouped shipments.
import mongoose from "mongoose";
import tenantScope from "./plugins/tenantScope.js";

// Each collection represents one produce delivery event. quantity * pricePerUnit
// is derived in the pre-save hook so totalValue is always consistent.
const collectionSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    // -- Reference to the member delivering produce --
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: [true, "Member is required"],
    },
    // -- Crop and quality --
    crop: {
      type: String,
      required: [true, "Crop is required"],
    },
    // -- Quantity / pricing --
    quantity: {
      type: Number,
      required: [true, "Quantity/weight is required"],
    },
    unit: {
      type: String,
      enum: ["kg", "lb", "bag", "tonne"],
      default: "kg",
    },
    qualityGrade: {
      type: String,
      default: "A",
    },
    pricePerUnit: {
      type: Number,
      default: 0,
    },
    // Derived: quantity * pricePerUnit, set by pre-save hook.
    totalValue: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // -- Location / GPS --
    collectionLocation: {
      type: String,
      trim: true,
    },
    gpsLat: {
      type: Number,
    },
    gpsLng: {
      type: Number,
    },
    // -- Batch reference --
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    // -- Media and notes --
    photo: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    // -- Audit: field officer who captured this record --
    capturedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Derive totalValue on every save so the value always matches quantity × price.
// Doing this in the model (rather than the controller) guarantees consistency
// even if a collection is created through another code path, and prevents a
// stale totalValue if quantity or price changes later.
collectionSchema.pre("save", function (next) {
  this.totalValue = (this.quantity || 0) * (this.pricePerUnit || 0);
  next();
});

// Tenant isolation (see plugin comment for details).
collectionSchema.plugin(tenantScope);

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
