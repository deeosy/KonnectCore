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

router.get('/tree', getGroupTree)
router.get('/unassigned-members', getUnassignedMembers)

router
  .route('/')
  .get(getGroups)
  .post(authorize('admin', 'manager'), audit('create', 'group'), createGroup)

router.post(
  '/:groupId/members',
  authorize('admin', 'manager'),
  audit('assign', 'group', { resourceIdFrom: (req) => req.params.groupId }),
  assignMembers
)
router.delete(
  '/:groupId/members',
  authorize('admin', 'manager'),
  audit('remove_members', 'group', { resourceIdFrom: (req) => req.params.groupId }),
  removeMembers
)
router.get('/:groupId/members', getGroupMembers)

router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'manager'), audit('update', 'group'), updateGroup)
  .delete(authorize('admin'), audit('delete', 'group'), deleteGroup)

export default router
