// Report routes — mount path: /api/reports
// All reports are admin/manager only, enforced once for the whole router via
// router.use(protect, authorize(...)). Each endpoint generates an aggregated,
// usually filterable, export-style report for its domain.

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

// GET /api/reports/members - aggregated member report
router.get('/members', memberReport)
// GET /api/reports/collections - aggregated collection report
router.get('/collections', collectionReport)
// GET /api/reports/payments - aggregated payment report
router.get('/payments', paymentReport)
// GET /api/reports/groups - aggregated group report
router.get('/groups', groupReport)
// GET /api/reports/loans - aggregated loan report
router.get('/loans', loanReport)
// GET /api/reports/expenses - aggregated expense report
router.get('/expenses', expenseReport)

export default router