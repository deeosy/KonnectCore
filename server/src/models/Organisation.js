import mongoose from 'mongoose'

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organisation name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    logo: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    settings: {
      currency: { type: String, default: 'GHS' },
      defaultCropPrices: { type: Map, of: Number, default: {} },
      qualityGrades: { type: [String], default: ['A', 'B', 'C'] },
      seasons: { type: [String], default: ['Major', 'Minor'] },
      deductionRules: { type: Map, of: Number, default: {} },
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

const Organisation = mongoose.model('Organisation', organisationSchema)

export default Organisation
