import { Router } from 'express'
import {
  getOrganisations,
  getOrganisation,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
  getOrgSettings,
  updateOrgSettings,
} from '../controllers/organisation.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

// Must be declared before the /:id route so "settings" isn't treated as an id.
router.get('/settings', getOrgSettings)
router.put(
  '/settings',
  authorize('admin'),
  audit('update', 'organisation_settings'),
  updateOrgSettings
)

router
  .route('/')
  .get(authorize('admin', 'manager'), getOrganisations)
  .post(authorize('admin'), audit('create', 'organisation'), createOrganisation)

router
  .route('/:id')
  .get(authorize('admin', 'manager'), getOrganisation)
  .put(authorize('admin'), audit('update', 'organisation'), updateOrganisation)
  .delete(authorize('admin'), audit('delete', 'organisation'), deleteOrganisation)

export default router
