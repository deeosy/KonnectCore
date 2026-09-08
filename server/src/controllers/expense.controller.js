import Expense from '../models/Expense.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getExpenses = async (req, res, next) => {
  try {
    const { category, from, to } = req.query
    const filter = {}
    if (category) filter.category = category
    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = new Date(from)
      if (to) filter.date.$lte = new Date(to)
    }

    const expenses = await Expense.find(filter)
      .populate('createdBy', 'name')
      .sort('-date')

    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)

    res.json({ success: true, count: expenses.length, total, data: expenses })
  } catch (error) {
    next(error)
  }
}

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user._id,
    })
    res.status(201).json({ success: true, data: expense })
  } catch (error) {
    next(error)
  }
}

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!expense) throw new ApiError(404, 'Expense not found')
    res.json({ success: true, data: expense })
  } catch (error) {
    next(error)
  }
}

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) throw new ApiError(404, 'Expense not found')
    res.json({ success: true, message: 'Expense removed' })
  } catch (error) {
    next(error)
  }
}
