import Member from "../models/Member.js";
import Collection from "../models/Collection.js";
import Payment from "../models/Payment.js";
import Group from "../models/Group.js";
import Loan from "../models/Loan.js";
import Expense from "../models/Expense.js";
import { sendXlsx } from "../utils/export.js";

// Builds a date-range filter used across several report endpoints. Only one
// bound (from or to) is required; both are optional.
const dateFromTo = (from, to) => {
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  return filter;
};

export const memberReport = async (req, res, next) => {
  try {
    const filter = {};
    const { status, groupId, crop, search } = req.query;
    if (search)
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { membershipNumber: { $regex: search, $options: "i" } },
      ];
    if (status) filter.status = status;
    if (groupId) filter.groupId = groupId;
    if (crop) filter.mainCrops = { $in: [crop] };

    const members = await Member.find(filter)
      .populate("groupId", "name")
      .populate("assignedOfficerId", "name")
      .lean();

    if (req.query.format === "xlsx") {
      const data = members.map((m) => ({
        firstName: m.firstName,
        lastName: m.lastName,
        phone: m.phone,
        membershipNumber: m.membershipNumber,
        location: m.location,
        status: m.status,
        group: m.groupId?.name || "",
        officer: m.assignedOfficerId?.name || "",
        farmSize: m.farmSize ?? "",
        crops: (m.mainCrops || []).join("; "),
      }));
      return sendXlsx(res, data, "Members", "member-report.xlsx");
    }

    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};

export const collectionReport = async (req, res, next) => {
  try {
    const filter = {};
    const { crop, memberId, groupId, from, to } = req.query;
    if (crop) filter.crop = crop;
    if (memberId) filter.memberId = memberId;

    let byGroup = null;
    if (groupId) {
      const members = await Member.find({ groupId }).select("_id");
      byGroup = { memberId: { $in: members.map((m) => m._id) } };
    }
    const dateFilter = dateFromTo(from, to);
    if (dateFilter.date) filter.date = dateFilter.date;

    const collections = await Collection.find({ ...filter, ...byGroup })
      .populate("memberId", "firstName lastName phone membershipNumber groupId")
      .populate("capturedBy", "name")
      .sort("-date")
      .lean();

    if (req.query.format === "xlsx") {
      const data = collections.map((c) => ({
        member: `${c.memberId?.firstName || ""} ${c.memberId?.lastName || ""}`,
        membershipNumber: c.memberId?.membershipNumber || "",
        crop: c.crop,
        quantity: c.quantity,
        unit: c.unit,
        grade: c.qualityGrade,
        pricePerUnit: c.pricePerUnit,
        totalValue: c.totalValue,
        date: c.date,
        location: c.collectionLocation || "",
        capturedBy: c.capturedBy?.name || "",
      }));
      return sendXlsx(res, data, "Collections", "collection-report.xlsx");
    }

    const totals = collections.reduce(
      (agg, c) => {
        agg.quantity += c.quantity || 0;
        agg.value += c.totalValue || 0;
        return agg;
      },
      { quantity: 0, value: 0 },
    );

    res.json({
      success: true,
      count: collections.length,
      totals,
      data: collections,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentReport = async (req, res, next) => {
  try {
    const filter = {};
    const { status, type, memberId, from, to } = req.query;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (memberId) filter.memberId = memberId;

    const dateFilter = dateFromTo(from, to);
    if (dateFilter.date) filter.paymentDate = dateFilter.date;

    const payments = await Payment.find(filter)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .populate("processedBy", "name")
      .sort("-paymentDate")
      .lean();

    if (req.query.format === "xlsx") {
      const data = payments.map((p) => ({
        member: `${p.memberId?.firstName || ""} ${p.memberId?.lastName || ""}`,
        type: p.type,
        amount: p.amount,
        amountPaid: p.amountPaid,
        status: p.status,
        method: p.method,
        receiptNumber: p.receiptNumber,
        paymentDate: p.paymentDate,
        processedBy: p.processedBy?.name || "",
      }));
      return sendXlsx(res, data, "Payments", "payment-report.xlsx");
    }

    const totals = {
      amount: payments.reduce((s, p) => s + (p.amount || 0), 0),
      amountPaid: payments.reduce((s, p) => s + (p.amountPaid || 0), 0),
    };

    res.json({ success: true, count: payments.length, totals, data: payments });
  } catch (error) {
    next(error);
  }
};

// Per-group aggregation of member/harvest/payment counts. Instead of one
// aggregation pipeline this issues a small batch of queries per group, run
// concurrently via Promise.all. Acceptable at the group counts typical for an
// MVP co-op, but it would become a bottleneck for organisations with hundreds
// of groups. If that happens, replace with $lookup + $group over collections
// and payments.
export const groupReport = async (req, res, next) => {
  try {
    const groups = await Group.find().populate("leaderId", "name").lean();

    const summary = await Promise.all(
      groups.map(async (g) => {
        const members = await Member.find({ groupId: g._id }).select("_id");
        const memberIds = members.map((m) => m._id);
        const collections = await Collection.find({
          memberId: { $in: memberIds },
        });
        const payments = await Payment.find({ memberId: { $in: memberIds } });
        return {
          ...g,
          memberCount: members.length,
          totalCollections: collections.length,
          totalHarvest: collections.reduce((s, c) => s + (c.quantity || 0), 0),
          totalHarvestValue: collections.reduce(
            (s, c) => s + (c.totalValue || 0),
            0,
          ),
          totalPayments: payments.length,
          totalPaid: payments.reduce((s, p) => s + (p.amountPaid || 0), 0),
        };
      }),
    );

    if (req.query.format === "xlsx") {
      const data = summary.map((g) => ({
        name: g.name,
        type: g.type,
        leader: g.leaderId?.name || "",
        memberCount: g.memberCount,
        totalCollections: g.totalCollections,
        totalHarvest: g.totalHarvest,
        totalHarvestValue: g.totalHarvestValue,
        totalPayments: g.totalPayments,
        totalPaid: g.totalPaid,
      }));
      return sendXlsx(res, data, "Groups", "group-report.xlsx");
    }

    res.json({ success: true, count: summary.length, data: summary });
  } catch (error) {
    next(error);
  }
};

export const loanReport = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const loans = await Loan.find(filter)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .sort("-createdAt")
      .lean();

    if (req.query.format === "xlsx") {
      const data = loans.map((l) => ({
        member: `${l.memberId?.firstName || ""} ${l.memberId?.lastName || ""}`,
        type: l.type,
        amount: l.amount,
        interestRate: l.interestRate,
        amountRepaid: l.amountRepaid,
        balance: l.balance,
        status: l.status,
        dueDate: l.dueDate,
      }));
      return sendXlsx(res, data, "Loans", "loan-report.xlsx");
    }

    res.json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    next(error);
  }
};

export const expenseReport = async (req, res, next) => {
  try {
    const expenses = await Expense.find()
      .populate("createdBy", "name")
      .sort("-date")
      .lean();
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    res.json({ success: true, total, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};
