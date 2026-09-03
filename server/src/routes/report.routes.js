import { Router } from 'express'
import {
  memberReport,
  collectionReport,
  paymentReport,
  groupReport,
  loanReport,
  expenseReport,
} from '../controllers/report.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect, authorize('admin', 'manager'))

router.get('/members', memberReport)
router.get('/collections', collectionReport)
router.get('/payments', paymentReport)
router.get('/groups', groupReport)
router.get('/loans', loanReport)
router.get('/expenses', expenseReport)

export default router