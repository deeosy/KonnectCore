// Expense controller. Simple CRUD for cooperative expenses with
// category and date-range filtering.
import Expense from '../models/Expense.js'
import { ApiError } from '../middleware/error.middleware.js'

// GET /api/expenses
// Lists expenses with optional category and date-range filters. Sums the
// amounts in memory (no aggregation) and returns a running total.
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

// POST /api/expenses
// Records an expense. createdBy is pinned to the acting user.
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

// PATCH /api/expenses/:id
// Partial update of an expense document.
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

// DELETE /api/expenses/:id
// Hard-deletes an expense record.
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) throw new ApiError(404, 'Expense not found')
    res.json({ success: true, message: 'Expense removed' })
  } catch (error) {
    next(error)
  }
}
