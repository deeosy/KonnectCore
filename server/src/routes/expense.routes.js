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

router
  .route('/')
  .get(authorize('admin', 'manager'), getExpenses)
  .post(authorize('admin', 'manager'), audit('create', 'expense'), createExpense)

router
  .route('/:id')
  .put(authorize('admin', 'manager'), audit('update', 'expense'), updateExpense)
  .delete(authorize('admin'), audit('delete', 'expense'), deleteExpense)

export default router
