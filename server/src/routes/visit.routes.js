// Visit routes — mount path: /api/visits
// All endpoints require an authenticated user (router.use(protect)).
// Field officers use the /me endpoints for their own members/tasks and can
// record visits (multi-photo upload) and update task status. Performance and
// cross-officer views plus task creation are admin/manager. Mutations audited.

import { Router } from 'express'
import {
  getVisits,
  createVisit,
  getVisitsByOfficer,
  getMyAssignedMembers,
  getMyTasks,
  updateTaskStatus,
  createTask,
  getOfficerPerformance,
} from '../controllers/visit.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { uploadVisitPhotos } from '../middleware/upload.middleware.js'
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

// GET /api/visits/performance - officer performance metrics (admin/manager)
router.get('/performance', authorize('admin', 'manager'), getOfficerPerformance)
// GET /api/visits/me/members - members assigned to the current officer
router.get('/me/members', getMyAssignedMembers)
// GET /api/visits/me/tasks - tasks assigned to the current officer
router.get('/me/tasks', getMyTasks)
// PUT /api/visits/tasks/:taskId - update task progress status (any authenticated user, audited)
router.put('/tasks/:taskId', audit('update', 'task', { resourceIdFrom: (req) => req.params.taskId }), updateTaskStatus)
// POST /api/visits/tasks - create a task for an officer (admin/manager, audited)
router.post('/tasks', authorize('admin', 'manager'), audit('create', 'task'), createTask)
// GET /api/visits/officer/:officerId - visits recorded by a specific officer (admin/manager)
router.get('/officer/:officerId', authorize('admin', 'manager'), getVisitsByOfficer)

// GET /api/visits - list visits; POST - record a visit (audited; accepts up to
// 5 photos via uploadVisitPhotos, retained in memory for later persistence)
router
  .route('/')
  .get(getVisits)
  .post(audit('record', 'visit'), uploadVisitPhotos, createVisit)

export default router
