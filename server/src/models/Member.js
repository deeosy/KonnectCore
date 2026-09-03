import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    fileName: { type: String },
    filePath: { type: String },
    fileType: { type: String },
    category: {
      type: String,
      enum: ['id_card', 'photo', 'agreement', 'other'],
      default: 'other',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const memberSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    membershipNumber: {
      type: String,
      trim: true,
    },
    idType: {
      type: String,
      enum: ['national_id', 'voter_id', 'passport', 'other'],
      default: 'other',
    },
    idNumber: {
      type: String,
      trim: true,
    },
    photo: {
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
    gpsLat: {
      type: Number,
    },
    gpsLng: {
      type: Number,
    },
    farmSize: {
      type: Number,
    },
    mainCrops: {
      type: [String],
      default: [],
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'blacklisted'],
      default: 'active',
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const Member = mongoose.model('Member', memberSchema)

export default Member
