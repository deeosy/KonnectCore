import Loan from '../models/Loan.js'
import Collection from '../models/Collection.js'
import { ApiError } from '../middleware/error.middleware.js'

function computeTotalRepayable(loan) {
  if (loan.interestType === 'reducing_balance') {
    let balance = loan.amount
    let totalInterest = 0
    const monthlyRate = loan.interestRate / 100 / 12
    const months = (loan.durationMonths || 1) / 12
    totalInterest = loan.amount * (loan.interestRate / 100) * months
    return Math.round(loan.amount + totalInterest)
  }
  // flat
  const interest = loan.amount * (loan.interestRate / 100)
  return Math.round(loan.amount + interest)
}

function calcCreditScore(memberId) {
  return new Promise((resolve) => {
    Collection.aggregate([
      { $match: { memberId } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } },
    ])
      .then(async (res) => {
        const paidCount = await Loan.countDocuments({ memberId, status: 'completed' })
        const overdueCount = await Loan.countDocuments({ memberId, status: 'overdue' })
        const qty = res[0]?.totalQty || 0
        let score = 0
        score += Math.min(60, qty / 100)
        score += Math.min(20, paidCount * 10)
        score -= overdueCount * 15
        resolve(Math.max(0, Math.round(score)))
      })
      .catch(() => resolve(0))
  })
}

export const getLoans = async (req, res, next) => {
  try {
    const { status, memberId, type } = req.query
    const filter = {}
    if (status) filter.status = status
    if (memberId) filter.memberId = memberId
    if (type) filter.type = type

    const loans = await Loan.find(filter)
      .populate('memberId', 'firstName lastName phone membershipNumber')
      .populate('approvedBy', 'name')
      .sort('-createdAt')

    res.json({ success: true, count: loans.length, data: loans })
  } catch (error) {
    next(error)
  }
}

export const getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('memberId', 'firstName lastName phone membershipNumber')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
    if (!loan) throw new ApiError(404, 'Loan not found')
    res.json({ success: true, data: loan })
  } catch (error) {
    next(error)
  }
}

export const requestLoan = async (req, res, next) => {
  try {
    const { memberId, amount, type, interestRate, interestType, durationMonths, purpose, dueDate } =
      req.body

    const { default: Member } = await import('../models/Member.js')
    const member = await Member.findById(memberId)
    if (!member) throw new ApiError(404, 'Member not found')

    const creditScore = await calcCreditScore(memberId)

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
    })

    res.status(201).json({ success: true, data: loan })
  } catch (error) {
    next(error)
  }
}

export const approveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
    if (!loan) throw new ApiError(404, 'Loan not found')
    if (loan.status !== 'pending') {
      throw new ApiError(400, 'Only pending loans can be approved')
    }

    loan.status = 'approved'
    loan.approvedBy = req.user._id
    loan.approvedAt = new Date()
    await loan.save()
    res.json({ success: true, data: loan })
  } catch (error) {
    next(error)
  }
}

export const disburseLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
    if (!loan) throw new ApiError(404, 'Loan not found')
    if (loan.status === 'completed' || loan.status === 'disbursed') {
      throw new ApiError(400, 'Loan already disbursed')
    }

    loan.status = 'disbursed'
    loan.disbursedAt = new Date()
    if (!loan.dueDate) {
      const d = new Date()
      d.setMonth(d.getMonth() + (loan.durationMonths || 1))
      loan.dueDate = d
    }
    await loan.save()
    res.json({ success: true, data: loan })
  } catch (error) {
    next(error)
  }
}

export const recordRepayment = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
    if (!loan) throw new ApiError(404, 'Loan not found')

    const { amount, method, date } = req.body
    if (!amount || amount <= 0) throw new ApiError(400, 'Valid amount is required')

    loan.repaymentSchedule.push({
      amount,
      method: method || 'deduction',
      date: date || new Date(),
      recordedBy: req.user._id,
    })

    loan.amountRepaid += amount
    if (loan.amountRepaid >= loan.amount) {
      let total = loan.amount
      if (loan.interestRate) {
        total = computeTotalRepayable(loan)
      }
      if (loan.amountRepaid >= total) {
        loan.status = 'completed'
      }
    }

    await loan.save()
    res.json({ success: true, data: loan })
  } catch (error) {
    next(error)
  }
}

export const autoDeductFromHarvest = async (req, res, next) => {
  try {
    const { memberId } = req.body
    const activeLoans = await Loan.find({ memberId, status: { $in: ['disbursed', 'approved'] } })

    if (!activeLoans.length) {
      return res.json({ success: true, message: 'No active loans', data: [] })
    }

    const results = []
    for (const loan of activeLoans) {
      const owed = loan.amount - loan.amountRepaid
      if (owed <= 0) continue

      const deduction = Math.min(owed, 0.3 * (req.body.produceValue || 0))
      loan.repaymentSchedule.push({ amount: deduction, method: 'deduction', recordedBy: req.user._id })
      loan.amountRepaid += deduction
      await loan.save()
      results.push({ loanId: loan._id, deducted: deduction })
    }

    res.json({ success: true, data: results })
  } catch (error) {
    next(error)
  }
}

export const checkOverdue = async (req, res, next) => {
  try {
    const now = new Date()
    const overdue = await Loan.find({
      status: { $in: ['disbursed', 'approved'] },
      dueDate: { $lt: now },
    })

    if (overdue.length) {
      await Loan.updateMany(
        { _id: { $in: overdue.map((l) => l._id) } },
        { status: 'overdue' }
      )
    }

    const overdueList = await Loan.find({ status: 'overdue' })
      .populate('memberId', 'firstName lastName phone membershipNumber')

    res.json({ success: true, count: overdueList.length, data: overdueList })
  } catch (error) {
    next(error)
  }
}
