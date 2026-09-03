import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    type: {
      type: String,
      enum: ['produce_payment', 'dues', 'contribution', 'savings', 'expense'],
      required: [true, 'Payment type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    method: {
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer', 'cheque', 'other'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'part_paid', 'cancelled'],
      default: 'pending',
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
        ref: 'Collection',
      },
    ],
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
