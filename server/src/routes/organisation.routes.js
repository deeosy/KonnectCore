import { Router } from 'express'
import {
  getOrganisations,
  getOrganisation,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
  getOrgSettings,
} from '../controllers/organisation.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

// Must be declared before the /:id route so "settings" isn't treated as an id.
router.get('/settings', getOrgSettings)

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
