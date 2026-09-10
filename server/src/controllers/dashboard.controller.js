import Member from "../models/Member.js";
import Group from "../models/Group.js";
import Collection from "../models/Collection.js";
import Payment from "../models/Payment.js";
import Loan from "../models/Loan.js";
import Expense from "../models/Expense.js";
import FieldVisit from "../models/FieldVisit.js";

// All dashboard start queries run in parallel via Promise.all below. Firing
// them off one after another would cost a separate MongoDB round-trip per
// stat — on a busy dashboard for a large cooperative that adds up.
export const getStats = async (req, res, next) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalGroups,
      totalCollections,
      totalCollectionsWeight,
      totalPaymentsPaid,
      totalDuesOwed,
      totalDuesPaid,
      totalLoans,
      totalLoansOutstanding,
      totalExpenses,
    ] = await Promise.all([
      Member.countDocuments({}),
      Member.countDocuments({ status: "active" }),
      Group.countDocuments({ type: { $ne: "organisation" } }),
      Collection.countDocuments({}),
      Collection.aggregate([
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),
      Payment.aggregate([
        { $match: { type: "dues" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { type: "dues", status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Loan.countDocuments({}),
      Loan.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const stats = {
      totalMembers,
      activeMembers,
      totalGroups,
      totalCollections,
      totalCollectionsWeight: totalCollectionsWeight[0]?.total || 0,
      totalPaymentsPaid: totalPaymentsPaid[0]?.total || 0,
      totalDuesOwed: totalDuesOwed[0]?.total || 0,
      totalDuesPaid: totalDuesPaid[0]?.total || 0,
      outstandingDues:
        (totalDuesOwed[0]?.total || 0) - (totalDuesPaid[0]?.total || 0),
      totalLoans,
      totalLoansOutstanding: totalLoansOutstanding[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// Fetches the latest of each activity type, then combines them into a single
// timeline sorted by date. The limit is applied per-entity before merging
// (hence the .limit in each query) to avoid pulling thousands of documents
// just to show 12 recent feed items.
export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [members, collections, payments, visits] = await Promise.all([
      Member.find()
        .select("firstName lastName photo createdAt")
        .populate("registeredBy", "name")
        .sort("-createdAt")
        .limit(limit)
        .lean(),
      Collection.find()
        .select("crop quantity totalValue date")
        .populate("memberId", "firstName lastName")
        .sort("-createdAt")
        .limit(limit)
        .lean(),
      Payment.find()
        .select("type amount status paymentDate")
        .populate("memberId", "firstName lastName")
        .sort("-createdAt")
        .limit(limit)
        .lean(),
      FieldVisit.find()
        .select("notes date officerId")
        .populate("officerId", "name")
        .sort("-createdAt")
        .limit(limit)
        .lean(),
    ]);

    const activity = [
      ...members.map((m) => ({
        type: "member",
        label: "Member added",
        detail: `${m.firstName} ${m.lastName || ""}`,
        date: m.createdAt,
      })),
      ...collections.map((c) => ({
        type: "collection",
        label: "Collection recorded",
        detail: `${c.memberId?.firstName || ""} - ${c.crop} ${c.quantity}kg`,
        date: c.createdAt,
      })),
      ...payments.map((p) => ({
        type: "payment",
        label: "Payment recorded",
        detail: `${p.memberId?.firstName || ""} - GHS ${p.amount}`,
        date: p.createdAt,
      })),
      ...visits.map((v) => ({
        type: "visit",
        label: "Field visit logged",
        detail: v.officerId?.name || "",
        date: v.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const getCollectionTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trend = await Collection.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$quantity" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: trend });
  } catch (error) {
    next(error);
  }
};

export const getPaymentBreakdown = async (req, res, next) => {
  try {
    const byStatus = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const byMethod = await Payment.aggregate([
      { $group: { _id: "$method", total: { $sum: "$amount" } } },
    ]);
    res.json({ success: true, data: { byStatus, byMethod } });
  } catch (error) {
    next(error);
  }
};

export const getMemberDistribution = async (req, res, next) => {
  try {
    const byStatus = await Member.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byGroup = await Member.aggregate([
      { $match: { groupId: { $ne: null } } },
      {
        $group: {
          _id: "$groupId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $project: {
          count: 1,
          name: { $arrayElemAt: ["$group.name", 0] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data: { byStatus, byGroup } });
  } catch (error) {
    next(error);
  }
};

// Cumulative member count over time, bucketed per full month. This lets the
// dashboard render a growth line without pulling every member row. Runs a
// single aggregation over createdAt.
export const getMemberGrowth = async (req, res, next) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 12, 36);
    const since = new Date();
    since.setDate(1);
    since.setMonth(since.getMonth() - (months - 1));
    since.setHours(0, 0, 0, 0);

    const buckets = await Member.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          added: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bucketMap = new Map(buckets.map((b) => [b._id, b.added]));
    const data = [];
    let running = await Member.countDocuments({ createdAt: { $lt: since } });
    for (let i = 0; i < months; i += 1) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      running += bucketMap.get(key) || 0;
      data.push({ month: key, added: bucketMap.get(key) || 0, running });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
