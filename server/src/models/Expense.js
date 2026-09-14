// Expense model — records operational expenses incurred by the cooperative
// (fuel, salaries, transport, supplies, equipment). Used by the expense
// controller and reflected in financial reports / dashboards.
import mongoose from 'mongoose'
import tenantScope from './plugins/tenantScope.js'

const expenseSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    // -- Expense classification --
    category: {
      type: String,
      enum: ['fuel', 'salary', 'transport', 'supplies', 'equipment', 'other'],
      default: 'other',
    },
    // -- Financials --
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
    // Path or URL to an uploaded receipt image.
    receipt: {
      type: String,
    },
    // -- Audit: staff member who recorded this expense --
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
expenseSchema.plugin(tenantScope)

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense
