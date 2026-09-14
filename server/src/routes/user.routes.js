// User routes — mount path: /api/users
// All endpoints require an authenticated user (router.use(protect)).
// Reads: admin/manager · writes/deletes: admin only. Mutations are audited.
// GET    /            - list users (admin/manager)
// POST   /            - create user (admin), audited
// GET    /:id         - single user detail (admin/manager)
// PUT    /:id         - update user (admin), audited
// DELETE /:id         - delete user (admin), audited

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

// GET /api/users - list users (admin/manager); POST /api/users - create user (admin, audited)
router
  .route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), audit('create', 'user'), createUser)

// GET /api/users/:id - user detail (admin/manager); PUT - update (admin, audited); DELETE - remove (admin, audited)
router
  .route('/:id')
  .get(authorize('admin', 'manager'), getUser)
  .put(authorize('admin'), audit('update', 'user'), updateUser)
  .delete(authorize('admin'), audit('delete', 'user'), deleteUser)

export default router
