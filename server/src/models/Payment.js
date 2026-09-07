import mongoose from "mongoose";

// Payments support partial settlement: amountPaid can be less than amount,
// and status reflects the payment progress (paid / part_paid / pending).
// The status transition logic lives in payment.controller.js rather than a
// pre-save hook because it also depends on the incoming request fields
// (e.g. whether amountPaid was explicitly supplied by the client).
const paymentSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    type: {
      type: String,
      enum: ["produce_payment", "dues", "contribution", "savings", "expense"],
      required: [true, "Payment type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    method: {
      type: String,
      enum: ["cash", "mobile_money", "bank_transfer", "cheque", "other"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "part_paid", "cancelled"],
      default: "pending",
    },
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
    relatedCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
