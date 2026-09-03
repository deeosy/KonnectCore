import { Router } from 'express'
import {
  getPayments,
  getPayment,
  createPayment,
  createProducePayment,
  updatePayment,
  deletePayment,
  getOutstanding,
} from '../controllers/payment.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/outstanding', authorize('admin', 'manager'), getOutstanding)
router.post('/produce', authorize('admin', 'manager', 'fieldOfficer'), createProducePayment)

router
  .route('/')
  .get(getPayments)
  .post(authorize('admin', 'manager'), createPayment)

router
  .route('/:id')
  .get(getPayment)
  .put(authorize('admin', 'manager'), updatePayment)
  .delete(authorize('admin'), deletePayment)

export default router
