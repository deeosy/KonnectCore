import { Router } from 'express'
import {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop,
} from '../controllers/crop.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

// All authenticated staff can read the crop list (used to populate dropdowns);
// only admins/managers can maintain the catalog.
router
  .route('/')
  .get(getCrops)
  .post(authorize('admin', 'manager'), createCrop)

router
  .route('/:id')
  .put(authorize('admin', 'manager'), updateCrop)
  .delete(authorize('admin'), deleteCrop)

export default router