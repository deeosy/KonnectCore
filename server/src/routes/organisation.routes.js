// Organisation routes — mount path: /api/organisations
// All endpoints require an authenticated user. Reads are admin/manager;
// writes and settings updates are admin only. Mutations are audited.

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
// GET /api/organisations/settings - org settings (any authenticated user)
router.get('/settings', getOrgSettings)
// PUT /api/organisations/settings - update org settings (admin, audited)
router.put(
  '/settings',
  authorize('admin'),
  audit('update', 'organisation_settings'),
  updateOrgSettings
)

// GET /api/organisations - list orgs (admin/manager); POST - create (admin, audited)
router
  .route('/')
  .get(authorize('admin', 'manager'), getOrganisations)
  .post(authorize('admin'), audit('create', 'organisation'), createOrganisation)

// GET /api/organisations/:id - org detail (admin/manager); PUT - update (admin,
// audited); DELETE - remove (admin, audited)
router
  .route('/:id')
  .get(authorize('admin', 'manager'), getOrganisation)
  .put(authorize('admin'), audit('update', 'organisation'), updateOrganisation)
  .delete(authorize('admin'), audit('delete', 'organisation'), deleteOrganisation)

export default router
