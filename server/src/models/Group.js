// Group model — self-referencing hierarchical tree used to organise members
// into regions, districts, groups, and communities. Referenced by Member.groupId
// and used by the group controller for CRUD and tree-walking queries.
import mongoose from "mongoose";
import tenantScope from "./plugins/tenantScope.js";

// Groups form a self-referencing hierarchy (Organisation > Region > District
// > Group > Community). parentId links a group to its parent; leaderId points
// to a staff User account that is responsible for the group.
const groupSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    // -- Core identity --
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Hierarchy level; determines the group's position in the tree.
    type: {
      type: String,
      enum: ["organisation", "region", "district", "group", "community"],
      default: "group",
    },
    // -- Self-referencing hierarchy --
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    // Staff member responsible for this group.
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

// Tenant isolation (see plugin comment for details).
groupSchema.plugin(tenantScope);

const Group = mongoose.model("Group", groupSchema);

export default Group;
