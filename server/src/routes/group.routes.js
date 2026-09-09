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

const router = Router()

router.use(protect)

router.get('/tree', getGroupTree)
router.get('/unassigned-members', getUnassignedMembers)

router
  .route('/')
  .get(getGroups)
  .post(authorize('admin', 'manager'), createGroup)

router.post(
  '/:groupId/members',
  authorize('admin', 'manager'),
  assignMembers
)
router.delete(
  '/:groupId/members',
  authorize('admin', 'manager'),
  removeMembers
)
router.get('/:groupId/members', getGroupMembers)

router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'manager'), updateGroup)
  .delete(authorize('admin'), deleteGroup)

export default router
