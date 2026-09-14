// Audit routes — mount path: /api/audit
// Admin-only (router.use(protect, authorize('admin'))). A read-only view of
// the audit trail written by the audit() middleware across other routes.

import { Router } from 'express'
import { getAuditLogs } from '../controllers/audit.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect, authorize('admin'))

// GET /api/audit - paginated/filtered audit log (admin only)
router.get('/', getAuditLogs)

export default router