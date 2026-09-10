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
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

router.get('/overdue', authorize('admin', 'manager'), checkOverdue)
router.post('/auto-deduct', authorize('admin', 'manager'), audit('auto_deduct', 'loan'), autoDeductFromHarvest)

router
  .route('/')
  .get(authorize('admin', 'manager'), getLoans)
  .post(authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'loan'), requestLoan)

router.get('/:id', getLoan)
router.put('/:id/approve', authorize('admin'), audit('approve', 'loan', { resourceIdFrom: (req) => req.params.id }), approveLoan)
router.put('/:id/disburse', authorize('admin'), audit('disburse', 'loan', { resourceIdFrom: (req) => req.params.id }), disburseLoan)
router.post('/:id/repayment', authorize('admin', 'manager'), audit('repayment', 'loan', { resourceIdFrom: (req) => req.params.id }), recordRepayment)

export default router
