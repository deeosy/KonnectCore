import { Router } from 'express'
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  assignMembers,
  getGroupMembers,
} from '../controllers/group.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(getGroups)
  .post(authorize('admin', 'manager'), createGroup)

router.post(
  '/:groupId/members',
  authorize('admin', 'manager'),
  assignMembers
)
router.get('/:groupId/members', getGroupMembers)

router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'manager'), updateGroup)
  .delete(authorize('admin'), deleteGroup)

export default router
