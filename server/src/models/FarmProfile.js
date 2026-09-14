// FarmProfile model — detailed farming record for a member. Contains an
// embedded array of crop plantings with lifecycle status (planted, growing,
// harvested, failed). Used by the farm profile controller for season tracking
// and yield analysis.
import mongoose from 'mongoose'
import tenantScope from './plugins/tenantScope.js'

// Embedded crop planting record within a farm profile. Tracks a single crop
// from planting through expected and actual harvest.
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
    // Crop lifecycle: planted -> growing -> harvested | failed.
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
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    // -- Reference to the member who owns this farm --
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    // -- Farm-level details --
    farmSize: {
      type: Number,
    },
    // -- Location / GPS --
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
    // -- Embedded crop plantings --
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

// Tenant isolation (see plugin comment for details).
farmProfileSchema.plugin(tenantScope)

const FarmProfile = mongoose.model('FarmProfile', farmProfileSchema)

export default FarmProfile
