import Collection from "../models/Collection.js";
import Payment from "../models/Payment.js";
import Loan from "../models/Loan.js";
import FieldVisit from "../models/FieldVisit.js";
import Member from "../models/Member.js";
import { ApiError } from "../middleware/error.middleware.js";

// Normalizes each activity type onto a consistent {ts} field so the timeline
// can be merged and sorted across collections, payments, loans, and visits —
// each of which uses a different date field (date vs createdAt vs paymentDate).
const addTimestamps = (items) =>
  items.map((i) => ({
    ...i,
    ts: new Date(i.date || i.createdAt || 0).getTime(),
  }));

export const getMemberHistory = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) throw new ApiError(404, "Member not found");

    const [collections, payments, loans, visits] = await Promise.all([
      Collection.find({ memberId: member._id })
        .select("crop quantity unit qualityGrade totalValue date capturedBy")
        .populate("capturedBy", "name")
        .lean(),
      Payment.find({ memberId: member._id })
        .select(
          "type amount method status receiptNumber paymentDate description",
        )
        .populate("processedBy", "name")
        .lean(),
      Loan.find({ memberId: member._id })
        .select("type amount amountRepaid balance status dueDate createdAt purpose repaymentSchedule")
        .lean(),
      FieldVisit.find({ memberId: member._id })
        .select("date notes gpsLat gpsLng officerId")
        .populate("officerId", "name")
        .lean(),
    ]);

    const timeline = [
      ...addTimestamps(
        collections.map((c) => ({
          type: "collection",
          date: c.date,
          title: `Collection - ${c.crop}`,
          detail: `${c.quantity} ${c.unit}, grade ${c.qualityGrade}, value ${c.totalValue}`,
          meta: c,
        })),
      ),
      ...addTimestamps(
        payments.map((p) => ({
          type: "payment",
          date: p.paymentDate,
          title: `Payment - ${p.type.replace(/_/g, " ")}`,
          detail: `${p.amount} (${p.status})`,
          meta: p,
        })),
      ),
      ...addTimestamps(
        loans.map((l) => ({
          type: "loan",
          date: l.createdAt,
          title: `Loan - ${l.type.replace(/_/g, " ")}`,
          detail: `${l.amount} borrowed, balance ${l.balance}`,
          meta: l,
        })),
      ),
      ...addTimestamps(
        visits.map((v) => ({
          type: "visit",
          date: v.date,
          title: "Field Visit",
          detail: v.notes || "Visit recorded",
          meta: v,
        })),
      ),
    ].sort((a, b) => b.ts - a.ts);

    res.json({
      success: true,
      data: {
        collections,
        payments,
        loans,
        visits,
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};
