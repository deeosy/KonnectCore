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

router.get('/performance', authorize('admin', 'manager'), getOfficerPerformance)
router.get('/me/members', getMyAssignedMembers)
router.get('/me/tasks', getMyTasks)
router.put('/tasks/:taskId', audit('update', 'task', { resourceIdFrom: (req) => req.params.taskId }), updateTaskStatus)
router.post('/tasks', authorize('admin', 'manager'), audit('create', 'task'), createTask)
router.get('/officer/:officerId', authorize('admin', 'manager'), getVisitsByOfficer)

router
  .route('/')
  .get(getVisits)
  .post(audit('record', 'visit'), uploadVisitPhotos, createVisit)

export default router
