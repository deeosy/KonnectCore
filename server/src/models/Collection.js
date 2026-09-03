import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    crop: {
      type: String,
      required: [true, 'Crop is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity/weight is required'],
    },
    unit: {
      type: String,
      enum: ['kg', 'lb', 'bag', 'tonne'],
      default: 'kg',
    },
    qualityGrade: {
      type: String,
      default: 'A',
    },
    pricePerUnit: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
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
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    capturedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

collectionSchema.pre('save', function (next) {
  this.totalValue = (this.quantity || 0) * (this.pricePerUnit || 0)
  next()
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection
