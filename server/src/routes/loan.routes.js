import { Router } from 'express'
import {
  getLoans,
  getLoan,
  requestLoan,
  approveLoan,
  disburseLoan,
  recordRepayment,
  autoDeductFromHarvest,
  checkOverdue,
} from '../controllers/loan.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/overdue', authorize('admin', 'manager'), checkOverdue)
router.post('/auto-deduct', authorize('admin', 'manager'), autoDeductFromHarvest)

router
  .route('/')
  .get(authorize('admin', 'manager'), getLoans)
  .post(authorize('admin', 'manager', 'fieldOfficer'), requestLoan)

router.get('/:id', getLoan)
router.put('/:id/approve', authorize('admin'), approveLoan)
router.put('/:id/disburse', authorize('admin'), disburseLoan)
router.post('/:id/repayment', authorize('admin', 'manager'), recordRepayment)

export default router
