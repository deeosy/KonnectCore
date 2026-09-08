import mongoose from 'mongoose'

const cropSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
    },
    variety: {
      type: String,
      trim: true,
    },
    areaHectares: {
      type: Number,
    },
    plantingDate: {
      type: Date,
    },
    season: {
      type: String,
      trim: true,
    },
    expectedHarvestDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['planted', 'growing', 'harvested', 'failed'],
      default: 'planted',
    },
    estimatedYield: {
      type: Number,
    },
    actualYield: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

const farmProfileSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    farmSize: {
      type: Number,
    },
    location: {
      type: String,
      trim: true,
    },
    gpsLat: {
      type: Number,
    },
    gpsLng: {
      type: Number,
    },
    currentSeason: {
      type: String,
      trim: true,
    },
    crops: {
      type: [cropSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const FarmProfile = mongoose.model('FarmProfile', farmProfileSchema)

export default FarmProfile
