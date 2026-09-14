// Payment model — tracks financial transactions against members (produce
// payments, dues, contributions, savings, expenses). Supports partial
// settlement, multiple payment methods, and optional Hubtel mobile-money
// gateway integration. Used by payment controllers and overdue reconciliation.
import mongoose from "mongoose";
import tenantScope from "./plugins/tenantScope.js";

// Payments support partial settlement: amountPaid can be less than amount,
// and status reflects the payment progress (paid / part_paid / pending).
// The status transition logic lives in payment.controller.js rather than a
// pre-save hook because it also depends on the incoming request fields
// (e.g. whether amountPaid was explicitly supplied by the client).
const paymentSchema = new mongoose.Schema(
  {
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    // -- Reference to the member this payment relates to --
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    // -- Payment classification --
    type: {
      type: String,
      enum: ["produce_payment", "dues", "contribution", "savings", "expense"],
      required: [true, "Payment type is required"],
    },
    // -- Financials: amount = total due, amountPaid = amount settled so far --
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    // -- Payment method --
    method: {
      type: String,
      enum: ["cash", "mobile_money", "bank_transfer", "cheque", "other"],
      default: "cash",
    },
    // -- Lifecycle: pending -> part_paid -> paid | cancelled --
    status: {
      type: String,
      enum: ["pending", "paid", "part_paid", "cancelled"],
      default: "pending",
    },
    // -- Payment gateway integration (Hubtel mobile money). Payments recorded by
    // other methods carry gateway: 'not_applicable'. Mobile money payments
    // initiated without Hubtel credentials are marked simulated so the dev/demo
    // flow works end to end without exposing fake transactions as real ones. --
    gateway: {
      type: String,
      enum: ["not_applicable", "hubtel"],
      default: "not_applicable",
    },
    // Transaction token returned by the gateway for reconciliation.
    gatewayReference: {
      type: String,
      trim: true,
    },
    // Raw gateway response status (pending / success / failed).
    gatewayStatus: {
      type: String,
      enum: ["pending", "success", "failed", ""],
      default: "",
    },
    // True when the payment was created in demo/simulated mode.
    simulated: {
      type: Boolean,
      default: false,
    },
    // -- External references --
    receiptNumber: {
      type: String,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    // -- Linked collections (for produce_payment type) --
    relatedCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    // -- Audit: staff member who processed this payment --
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Tenant isolation (see plugin comment for details).
paymentSchema.plugin(tenantScope);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
