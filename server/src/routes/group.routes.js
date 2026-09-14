// Group routes — mount path: /api/groups
// All endpoints require an authenticated user (router.use(protect)).
// Reads are open to any authenticated user; creates/updates/member assignment
// are admin/manager; deletes are admin only. All mutations are audited.

import { Router } from 'express'
import {
  getGroups,
  getGroup,
  getGroupTree,
  createGroup,
  updateGroup,
  deleteGroup,
  assignMembers,
  removeMembers,
  getUnassignedMembers,
  getGroupMembers,
} from '../controllers/group.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

// GET /api/groups/tree - nested hierarchy of groups for navigation
router.get('/tree', getGroupTree)
// GET /api/groups/unassigned-members - members not yet added to any group
router.get('/unassigned-members', getUnassignedMembers)

// GET /api/groups - list groups; POST - create group (admin/manager, audited)
router
  .route('/')
  .get(getGroups)
  .post(authorize('admin', 'manager'), audit('create', 'group'), createGroup)

// POST /api/groups/:groupId/members - assign members to a group (admin/manager, audited)
router.post(
  '/:groupId/members',
  authorize('admin', 'manager'),
  audit('assign', 'group', { resourceIdFrom: (req) => req.params.groupId }),
  assignMembers
)
// DELETE /api/groups/:groupId/members - remove members from a group (admin/manager, audited)
router.delete(
  '/:groupId/members',
  authorize('admin', 'manager'),
  audit('remove_members', 'group', { resourceIdFrom: (req) => req.params.groupId }),
  removeMembers
)
// GET /api/groups/:groupId/members - members currently in a group
router.get('/:groupId/members', getGroupMembers)

// GET /api/groups/:id - group detail; PUT - update (admin/manager, audited);
// DELETE - remove group (admin, audited)
router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'manager'), audit('update', 'group'), updateGroup)
  .delete(authorize('admin'), audit('delete', 'group'), deleteGroup)

export default router
