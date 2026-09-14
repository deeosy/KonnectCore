// FieldVisit model — logs a field officer's visit to a member's location.
// Records GPS coordinates, purpose, notes, and photos for audit and reporting.
// Used by the field visit controller and referenced in dashboards.
import mongoose from 'mongoose'
import tenantScope from './plugins/tenantScope.js'

const visitSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    // -- The officer conducting the visit (required) --
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer is required'],
    },
    // -- Member being visited --
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    // -- Visit details --
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    // -- Location / GPS at the time of visit --
    gpsLat: {
      type: Number,
    },
    gpsLng: {
      type: Number,
    },
    // -- Photo evidence (array of URLs / file paths) --
    photos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Tenant isolation (see plugin comment for details).
visitSchema.plugin(tenantScope)

const FieldVisit = mongoose.model('FieldVisit', visitSchema)

export default FieldVisit
