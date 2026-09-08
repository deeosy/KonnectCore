import mongoose from "mongoose";

// Groups form a self-referencing hierarchy (Organisation > Region > District
// > Group > Community). parentId links a group to its parent; leaderId points
// to a staff User account that is responsible for the group.
const groupSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["organisation", "region", "district", "group", "community"],
      default: "group",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: String,
      trim: true,
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

const Group = mongoose.model("Group", groupSchema);

export default Group;
