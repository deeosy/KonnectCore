import { Router } from 'express'
import {
  getOrganisations,
  getOrganisation,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from '../controllers/organisation.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(authorize('admin', 'manager'), getOrganisations)
  .post(authorize('admin'), createOrganisation)

router
  .route('/:id')
  .get(authorize('admin', 'manager'), getOrganisation)
  .put(authorize('admin'), updateOrganisation)
  .delete(authorize('admin'), deleteOrganisation)

export default router
