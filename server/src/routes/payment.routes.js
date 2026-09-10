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

router.get('/outstanding', authorize('admin', 'manager'), getOutstanding)
router.post('/produce', authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'payment'), createProducePayment)
router.get('/:id/status', authorize('admin', 'manager'), getPaymentGatewayStatus)

router
  .route('/')
  .get(getPayments)
  .post(authorize('admin', 'manager'), audit('create', 'payment'), createPayment)

router
  .route('/:id')
  .get(getPayment)
  .put(authorize('admin', 'manager'), audit('update', 'payment'), updatePayment)
  .delete(authorize('admin'), audit('delete', 'payment'), deletePayment)

export default router
