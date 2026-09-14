// Payment routes — mount path: /api/payments
// Hubtel callback is public (webhook). Everything else requires an
// authenticated user (router.use(protect)). Reads/produce payments are open
// to field officers; cash payments and gateway queries are admin/manager;
// deletes are admin only. Mutations are audited.

import { Router } from 'express'
import {
  getPayments,
  getPayment,
  createPayment,
  createProducePayment,
  updatePayment,
  deletePayment,
  getOutstanding,
  getPaymentGatewayStatus,
  hubtelCallback,
} from '../controllers/payment.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { audit } from '../utils/audit.js'

const router = Router()

// Public webhook target for Hubtel transaction notifications. This must NOT
// require authentication - Hubtel has no KonnectCore JWT. Live deployments
// should verify the Hubtel signature header inside hubtelCallback.
router.post('/hubtel/callback', hubtelCallback)

router.use(protect)

// GET /api/payments/outstanding - members with unpaid balances (admin/manager)
router.get('/outstanding', authorize('admin', 'manager'), getOutstanding)
// POST /api/payments/produce - record payment made in produce/kind (admin/manager/fieldOfficer, audited)
router.post('/produce', authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'payment'), createProducePayment)
// GET /api/payments/:id/status - query hubtel gateway status for a payment (admin/manager)
router.get('/:id/status', authorize('admin', 'manager'), getPaymentGatewayStatus)

// GET /api/payments - list payments; POST - record a cash payment (admin/manager, audited)
router
  .route('/')
  .get(getPayments)
  .post(authorize('admin', 'manager'), audit('create', 'payment'), createPayment)

// GET /api/payments/:id - payment detail; PUT - update (admin/manager, audited);
// DELETE - remove (admin, audited)
router
  .route('/:id')
  .get(getPayment)
  .put(authorize('admin', 'manager'), audit('update', 'payment'), updatePayment)
  .delete(authorize('admin'), audit('delete', 'payment'), deletePayment)

export default router
