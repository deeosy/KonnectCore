// Batch model — groups collections into a single shipment or delivery unit.
// Tracks batch number, total weight, status, and buyer. Used by the batch
// controller and linked from Collection.batchId.
import mongoose from 'mongoose'
import tenantScope from './plugins/tenantScope.js'

const batchSchema = new mongoose.Schema(
  {
    // -- Unique batch identifier (e.g. "BATCH-20260911-001") --
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    // -- Logistics --
    collectionPoint: {
      type: String,
      trim: true,
    },
    buyer: {
      type: String,
      trim: true,
    },
    // -- Lifecycle: open -> closed -> shipped -> delivered --
    status: {
      type: String,
      enum: ['open', 'closed', 'shipped', 'delivered'],
      default: 'open',
    },
    // Aggregated from linked collections (updated by controller logic).
    totalWeight: {
      type: Number,
      default: 0,
    },
    certification: {
      type: String,
      trim: true,
    },
    // -- Audit: staff member who created this batch --
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
batchSchema.plugin(tenantScope)

const Batch = mongoose.model('Batch', batchSchema)

export default Batch
