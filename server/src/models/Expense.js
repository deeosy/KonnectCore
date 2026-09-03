import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    category: {
      type: String,
      enum: ['fuel', 'salary', 'transport', 'supplies', 'equipment', 'other'],
      default: 'other',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receipt: {
      type: String,
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

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense
