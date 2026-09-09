import mongoose from "mongoose";

// Reference catalog of crops the cooperative trades in. Members pick crop
// names from this list when recording farm profiles and collections. Keeping
// a dedicated collection (instead of a hard-coded frontend constant) lets
// admins add/rename crops without a code deploy, and lets the API seed them
// for new environments.
const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      trim: true,
      default: "other",
    },
    unit: {
      type: String,
      trim: true,
      default: "kg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

const Crop = mongoose.model("Crop", cropSchema);

export default Crop;