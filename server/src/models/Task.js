// Task model — assignable work items for staff members (follow-ups, data
// verification, loan processing, etc.). Can be scoped to a specific member.
// Used by the task controller and surfaced in officer dashboards.
import mongoose from 'mongoose'
import tenantScope from './plugins/tenantScope.js'

const taskSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    // -- Assignment: staff member responsible for this task --
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // -- Optional link to a member this task relates to --
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    // -- Task details --
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    // -- Lifecycle: pending -> in_progress -> completed | cancelled --
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    // -- Audit: staff member who created this task --
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Tenant isolation (see plugin comment for details).
taskSchema.plugin(tenantScope)

const Task = mongoose.model('Task', taskSchema)

export default Task
