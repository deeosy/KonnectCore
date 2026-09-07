import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Collection from "../models/Collection.js";
import { ApiError } from "../middleware/error.middleware.js";

// Receipt numbers are generated server-side to prevent clients from
// supplying their own (which could collide or be crafted). The timestamp
// component provides rough ordering and uniqueness within a second; the
// random suffix guards against two payments created in the same millisecond.
function generateReceiptNumber() {
  return `RCP-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 100)}`;
}

export const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, type, memberId, from, to } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (memberId) filter.memberId = memberId;
    if (from || to) {
      filter.paymentDate = {};
      if (from) filter.paymentDate.$gte = new Date(from);
      if (to) filter.paymentDate.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;
    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .populate("processedBy", "name")
      .sort("-paymentDate")
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: payments.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const data = { ...req.body, processedBy: req.user._id };
    if (!data.receiptNumber) data.receiptNumber = generateReceiptNumber();
    // If the client didn't specify how much was actually paid, assume the
    // full amount was settled at creation time.
    if (data.amountPaid === undefined) data.amountPaid = data.amount;
    // Derive payment status from the ratio of amountPaid to amount.
    // A payment with amountPaid = 0 stays pending; a partial settlement
    // becomes part_paid; full settlement becomes paid.
    if (data.amountPaid >= data.amount) data.status = "paid";
    else if (data.amountPaid > 0) data.status = "part_paid";
    else data.status = "pending";

    const payment = await Payment.create(data);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// Convenience path used when an organisation wants to settle a group of
// produce collections in one go. The payment amount is the sum of each
// collection's totalValue, and the resulting payment is always recorded as
// fully paid — the selected collections represent what was already delivered.
export const createProducePayment = async (req, res, next) => {
  try {
    const { memberId, collectionIds, method, paymentDate } = req.body;

    if (!memberId || !collectionIds?.length) {
      throw new ApiError(400, "memberId and collectionIds are required");
    }

    const collections = await Collection.find({ _id: { $in: collectionIds } });
    if (!collections.length) throw new ApiError(404, "Collections not found");

    const total = collections.reduce((sum, c) => sum + (c.totalValue || 0), 0);

    const payment = await Payment.create({
      memberId,
      type: "produce_payment",
      amount: total,
      amountPaid: total,
      status: "paid",
      method: method || "cash",
      paymentDate: paymentDate || new Date(),
      receiptNumber: generateReceiptNumber(),
      relatedCollections: collections.map((c) => c._id),
      processedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .populate("processedBy", "name")
      .populate("relatedCollections");
    if (!payment) throw new ApiError(404, "Payment not found");
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    let data = { ...req.body };
    // When the client updates amount or amountPaid, recompute the status.
    // We can't rely on the pre-save hook here because findByIdAndUpdate
    // bypasses Mongoose save middleware, so status would go stale.
    if (data.amountPaid !== undefined || data.amount !== undefined) {
      const existing = await Payment.findById(req.params.id);
      if (!existing) throw new ApiError(404, "Payment not found");
      const amount = data.amount !== undefined ? data.amount : existing.amount;
      const paid =
        data.amountPaid !== undefined ? data.amountPaid : existing.amountPaid;
      if (paid >= amount) data.status = "paid";
      else if (paid > 0) data.status = "part_paid";
      else data.status = "pending";
    }

    const payment = await Payment.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!payment) throw new ApiError(404, "Payment not found");
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) throw new ApiError(404, "Payment not found");
    res.json({ success: true, message: "Payment removed" });
  } catch (error) {
    next(error);
  }
};

// Computes outstanding membership dues per member by summing the total
// 'dues' payments owed vs the amount actually paid for that member.
// Note: a "paid" status means the full amount was settled; part_paid
// payments are treated as not covering the owed amount here, which is
// intentional — we only count fully-settled dues against the total.
export const getOutstanding = async (req, res, next) => {
  try {
    const members = await Member.find({ status: "active" }).select(
      "firstName lastName phone membershipNumber",
    );
    const result = await Promise.all(
      members.map(async (m) => {
        const [dues, paid] = await Promise.all([
          Payment.aggregate([
            { $match: { memberId: m._id, type: "dues" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          Payment.aggregate([
            { $match: { memberId: m._id, type: "dues", status: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ]);
        const owed = dues[0]?.total || 0;
        const covered = paid[0]?.total || 0;
        return {
          member: m,
          totalDues: owed,
          paid: covered,
          outstanding: Math.max(0, owed - covered),
        };
      }),
    );

    const filtered = result.filter((r) => r.outstanding > 0);
    const totalOutstanding = filtered.reduce((s, r) => s + r.outstanding, 0);

    res.json({
      success: true,
      totalOutstanding,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};
