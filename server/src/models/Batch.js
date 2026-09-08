import mongoose from 'mongoose'

const batchSchema = new mongoose.Schema(
  {
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    collectionPoint: {
      type: String,
      trim: true,
    },
    buyer: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'shipped', 'delivered'],
      default: 'open',
    },
    totalWeight: {
      type: Number,
      default: 0,
    },
    certification: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const Batch = mongoose.model('Batch', batchSchema)

export default Batch
