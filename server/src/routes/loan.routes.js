// Loan routes — mount path: /api/loans
// All endpoints require an authenticated user (router.use(protect)).
// Field officers can request loans; list/repayments are admin/manager;
// approval and disbursement are admin only. All mutations are audited.

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

// GET /api/loans/overdue - flag loans past their due date (admin/manager)
router.get('/overdue', authorize('admin', 'manager'), checkOverdue)
// POST /api/loans/auto-deduct - auto-deduct repayments from pending harvest payouts (admin/manager, audited)
router.post('/auto-deduct', authorize('admin', 'manager'), audit('auto_deduct', 'loan'), autoDeductFromHarvest)

// GET /api/loans - list loans (admin/manager); POST - request a loan
// (admin/manager/fieldOfficer, audited)
router
  .route('/')
  .get(authorize('admin', 'manager'), getLoans)
  .post(authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'loan'), requestLoan)

// GET /api/loans/:id - single loan detail (any authenticated user)
router.get('/:id', getLoan)
// PUT /api/loans/:id/approve - approve a pending loan (admin, audited)
router.put('/:id/approve', authorize('admin'), audit('approve', 'loan', { resourceIdFrom: (req) => req.params.id }), approveLoan)
// PUT /api/loans/:id/disburse - release approved loan funds (admin, audited)
router.put('/:id/disburse', authorize('admin'), audit('disburse', 'loan', { resourceIdFrom: (req) => req.params.id }), disburseLoan)
// POST /api/loans/:id/repayment - record a repayment against a loan (admin/manager, audited)
router.post('/:id/repayment', authorize('admin', 'manager'), audit('repayment', 'loan', { resourceIdFrom: (req) => req.params.id }), recordRepayment)

export default router
