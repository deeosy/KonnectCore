// Loan model — tracks loans issued to members (input, cash, emergency,
// equipment). Maintains a repayment schedule, balance, credit history, and
// lifecycle status. Used by loan controllers and the overdue service.
import mongoose from "mongoose";
import tenantScope from "./plugins/tenantScope.js";

// Individual repayment record embedded inside a loan. Supports auto-deduction
// from collections as well as manual cash/mobile-money payments.
const repaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ["deduction", "cash", "mobile_money", "bank_transfer", "other"],
      default: "deduction",
    },
    // Link back to the collection that triggered an automatic deduction.
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
    // Link to the payment record when repayment was made externally.
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Simple audit trail of credit-related events (approvals, disbursements,
// repayments). Kept as a flat array rather than a separate collection.
const creditHistorySchema = new mongoose.Schema(
  {
    event: { type: String },
    date: { type: Date, default: Date.now },
    amount: { type: Number },
  },
  { _id: false },
);

const loanSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    // -- Reference to the borrower --
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: [true, "Member is required"],
    },
    // -- Loan terms --
    type: {
      type: String,
      enum: ["input", "cash", "emergency", "equipment"],
      default: "cash",
    },
    amount: {
      type: Number,
      required: [true, "Loan amount is required"],
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    // flat = simple interest on principal; reducing_balance = compound.
    interestType: {
      type: String,
      enum: ["flat", "reducing_balance"],
      default: "flat",
    },
    durationMonths: {
      type: Number,
      default: 3,
    },
    // -- Repayment tracking --
    repaymentSchedule: {
      type: [repaymentSchema],
      default: [],
    },
    amountRepaid: {
      type: Number,
      default: 0,
    },
    // Derived: max(0, amount - amountRepaid), set by pre-save hook.
    balance: {
      type: Number,
      default: 0,
    },
    // -- Lifecycle: pending -> approved -> disbursed -> completed | overdue --
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "disbursed",
        "completed",
        "overdue",
        "rejected",
      ],
      default: "pending",
    },
    // -- Approval and disbursement timestamps --
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    // -- Credit scoring --
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
  },
);

// A loan's balance is always derived from principal minus what has been
// repaid. The pre-save hook clamps to zero so a fully-repaid loan never shows
// a negative balance in UI or reports.
loanSchema.pre("save", function (next) {
  this.balance = Math.max(0, this.amount - this.amountRepaid);
  next();
});

// Tenant isolation (see plugin comment for details).
loanSchema.plugin(tenantScope);

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
