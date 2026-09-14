// Crop routes — mount path: /api/crops
// Reads are open to any authenticated user; catalog maintenance is limited
// to admin/manager (deletes admin only). Not audited — catalog is reference
// data, not a business transaction.

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
// GET /api/crops - list crops; POST - create (admin/manager)
router
  .route('/')
  .get(getCrops)
  .post(authorize('admin', 'manager'), createCrop)

// PUT /api/crops/:id - update crop (admin/manager); DELETE - remove (admin)
router
  .route('/:id')
  .put(authorize('admin', 'manager'), updateCrop)
  .delete(authorize('admin'), deleteCrop)

export default router