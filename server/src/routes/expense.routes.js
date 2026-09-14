// Expense routes — mount path: /api/expenses
// Entirely restricted to admin/manager roles (plus router.use(protect)).
// Reads: admin/manager · writes: admin/manager · deletes: admin only.
// All mutations are audited.

import { Router } from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

// GET /api/expenses - list expenses (admin/manager); POST - create (admin/manager, audited)
router
  .route('/')
  .get(authorize('admin', 'manager'), getExpenses)
  .post(authorize('admin', 'manager'), audit('create', 'expense'), createExpense)

// PUT /api/expenses/:id - update (admin/manager, audited); DELETE - remove (admin, audited)
router
  .route('/:id')
  .put(authorize('admin', 'manager'), audit('update', 'expense'), updateExpense)
  .delete(authorize('admin'), audit('delete', 'expense'), deleteExpense)

export default router
