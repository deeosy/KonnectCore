import mongoose from 'mongoose'

const repaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ['deduction', 'cash', 'mobile_money', 'bank_transfer', 'other'],
      default: 'deduction',
    },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const creditHistorySchema = new mongoose.Schema(
  {
    event: { type: String },
    date: { type: Date, default: Date.now },
    amount: { type: Number },
  },
  { _id: false }
)

const loanSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    type: {
      type: String,
      enum: ['input', 'cash', 'emergency', 'equipment'],
      default: 'cash',
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    interestType: {
      type: String,
      enum: ['flat', 'reducing_balance'],
      default: 'flat',
    },
    durationMonths: {
      type: Number,
      default: 3,
    },
    repaymentSchedule: {
      type: [repaymentSchema],
      default: [],
    },
    amountRepaid: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'disbursed', 'completed', 'overdue', 'rejected'],
      default: 'pending',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    disbursedAt: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    purpose: {
      type: String,
      trim: true,
    },
    creditScore: {
      type: Number,
      default: 0,
    },
    creditHistory: {
      type: [creditHistorySchema],
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

loanSchema.pre('save', function (next) {
  this.balance = Math.max(0, this.amount - this.amountRepaid)
  next()
})

const Loan = mongoose.model('Loan', loanSchema)

export default Loan
