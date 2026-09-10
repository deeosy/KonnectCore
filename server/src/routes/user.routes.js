import { Router } from 'express'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), audit('create', 'user'), createUser)

router
  .route('/:id')
  .get(authorize('admin', 'manager'), getUser)
  .put(authorize('admin'), audit('update', 'user'), updateUser)
  .delete(authorize('admin'), audit('delete', 'user'), deleteUser)

export default router
