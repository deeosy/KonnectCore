import { Router } from 'express'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), createUser)

router
  .route('/:id')
  .get(authorize('admin', 'manager'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser)

export default router
