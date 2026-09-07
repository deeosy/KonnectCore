import Loan from "../models/Loan.js";
import Collection from "../models/Collection.js";
import { ApiError } from "../middleware/error.middleware.js";

// Total amount the borrower owes including interest. Two interest models are
// supported:
//   - flat: single interest charge on the full principal for the whole term
//   - reducing_balance: currently implemented as simple interest on the
//     principal pro-rated to the term (annual rate scaled by durationMonths/12),
//     not a true reducing-balance amortisation. Named as it is for product
//     clarity, amounts may differ from a bank's reducing-balance calculation.
// The reducing_balance branch also leaves an unused balance/monthlyRate pair;
// kept as scaffolding for a future per-period amortisation.
function computeTotalRepayable(loan) {
  if (loan.interestType === "reducing_balance") {
    let balance = loan.amount;
    let totalInterest = 0;
    const monthlyRate = loan.interestRate / 100 / 12;
    const months = (loan.durationMonths || 1) / 12;
    totalInterest = loan.amount * (loan.interestRate / 100) * months;
    return Math.round(loan.amount + totalInterest);
  }
  // flat
  const interest = loan.amount * (loan.interestRate / 100);
  return Math.round(loan.amount + interest);
}

// A simple deterministic credit score based on quantifiable activity:
//   - up to 60 points from total produce quantity ever delivered (100 units = 60 pts)
//   - up to 20 points from completed loans (10 pts each, capped)
//   - minus 15 points per overdue loan
// Scores can therefore range below zero; the final value is clamped to a
// minimum of 0. This score is stored on the loan record at request time and
// is not recomputed later, so it reflects the member's history when they applied.
function calcCreditScore(memberId) {
  return new Promise((resolve) => {
    Collection.aggregate([
      { $match: { memberId } },
      { $group: { _id: null, totalQty: { $sum: "$quantity" } } },
    ])
      .then(async (res) => {
        const paidCount = await Loan.countDocuments({
          memberId,
          status: "completed",
        });
        const overdueCount = await Loan.countDocuments({
          memberId,
          status: "overdue",
        });
        const qty = res[0]?.totalQty || 0;
        let score = 0;
        score += Math.min(60, qty / 100);
        score += Math.min(20, paidCount * 10);
        score -= overdueCount * 15;
        resolve(Math.max(0, Math.round(score)));
      })
      .catch(() => resolve(0));
  });
}

export const getLoans = async (req, res, next) => {
  try {
    const { status, memberId, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (memberId) filter.memberId = memberId;
    if (type) filter.type = type;

    const loans = await Loan.find(filter)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .populate("approvedBy", "name")
      .sort("-createdAt");

    res.json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    next(error);
  }
};

export const getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .populate("requestedBy", "name")
      .populate("approvedBy", "name");
    if (!loan) throw new ApiError(404, "Loan not found");
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

export const requestLoan = async (req, res, next) => {
  try {
    const {
      memberId,
      amount,
      type,
      interestRate,
      interestType,
      durationMonths,
      purpose,
      dueDate,
    } = req.body;

    const { default: Member } = await import("../models/Member.js");
    const member = await Member.findById(memberId);
    if (!member) throw new ApiError(404, "Member not found");

    const creditScore = await calcCreditScore(memberId);

    const loan = await Loan.create({
      memberId,
      amount,
      type,
      interestRate,
      interestType,
      durationMonths,
      purpose,
      dueDate,
      requestedBy: req.user._id,
      creditScore,
      amountRepaid: 0,
      balance: amount,
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Loan lifecycle is a strict state machine: pending → approved → disbursed
// → completed/overdue. Approving is restricted to admin-only routes (see
// loan.routes.js), and the state check below prevents re-approving a loan
// that has already moved forward (e.g. a disbursed loan cannot be re-approved).
export const approveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) throw new ApiError(404, "Loan not found");
    if (loan.status !== "pending") {
      throw new ApiError(400, "Only pending loans can be approved");
    }

    loan.status = "approved";
    loan.approvedBy = req.user._id;
    loan.approvedAt = new Date();
    await loan.save();
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

export const disburseLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) throw new ApiError(404, "Loan not found");
    if (loan.status === "completed" || loan.status === "disbursed") {
      throw new ApiError(400, "Loan already disbursed");
    }

    loan.status = "disbursed";
    loan.disbursedAt = new Date();
    // If the request didn't specify a due date, default it to the loan
    // duration from the disbursal date rather than the request date.
    if (!loan.dueDate) {
      const d = new Date();
      d.setMonth(d.getMonth() + (loan.durationMonths || 1));
      loan.dueDate = d;
    }
    await loan.save();
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

export const recordRepayment = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) throw new ApiError(404, "Loan not found");

    const { amount, method, date } = req.body;
    if (!amount || amount <= 0)
      throw new ApiError(400, "Valid amount is required");

    // Each repayment is appended to an immutable schedule — we never update
    // or delete past entries, preserving the audit trail.
    loan.repaymentSchedule.push({
      amount,
      method: method || "deduction",
      date: date || new Date(),
      recordedBy: req.user._id,
    });

    loan.amountRepaid += amount;
    // A loan is only marked completed when the repaid amount covers the
    // principal plus any interest. If only the principal were used as the
    // threshold, interest would be silently forgiven when the borrower's
    // repayments reached the original loan amount.
    if (loan.amountRepaid >= loan.amount) {
      let total = loan.amount;
      if (loan.interestRate) {
        total = computeTotalRepayable(loan);
      }
      if (loan.amountRepaid >= total) {
        loan.status = "completed";
      }
    }

    await loan.save();
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Automatically deducts loan repayments from the value of a member's produce
// delivery. The deduction is capped at 30% of the produce value per harvest
// — an organisation-level policy to ensure the farmer still receives cash
// from every delivery rather than the full amount going to loan recovery.
export const autoDeductFromHarvest = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const activeLoans = await Loan.find({
      memberId,
      status: { $in: ["disbursed", "approved"] },
    });

    if (!activeLoans.length) {
      return res.json({ success: true, message: "No active loans", data: [] });
    }

    const results = [];
    for (const loan of activeLoans) {
      const owed = loan.amount - loan.amountRepaid;
      if (owed <= 0) continue;

      const deduction = Math.min(owed, 0.3 * (req.body.produceValue || 0));
      loan.repaymentSchedule.push({
        amount: deduction,
        method: "deduction",
        recordedBy: req.user._id,
      });
      loan.amountRepaid += deduction;
      await loan.save();
      results.push({ loanId: loan._id, deducted: deduction });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// Marks loans as overdue when their dueDate has passed. The update is
// batched (rather than per-loan save) so a single call handles all overdue
// loans. This is invoked manually via the /overdue endpoint; there is no
// scheduled job, so administrators must trigger it periodically.
export const checkOverdue = async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await Loan.find({
      status: { $in: ["disbursed", "approved"] },
      dueDate: { $lt: now },
    });

    if (overdue.length) {
      await Loan.updateMany(
        { _id: { $in: overdue.map((l) => l._id) } },
        { status: "overdue" },
      );
    }

    const overdueList = await Loan.find({ status: "overdue" }).populate(
      "memberId",
      "firstName lastName phone membershipNumber",
    );

    res.json({ success: true, count: overdueList.length, data: overdueList });
  } catch (error) {
    next(error);
  }
};
