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
import { uploadVisitPhoto } from '../middleware/upload.middleware.js'

const router = Router()

router.use(protect)

router.get('/performance', authorize('admin', 'manager'), getOfficerPerformance)
router.get('/me/members', getMyAssignedMembers)
router.get('/me/tasks', getMyTasks)
router.put('/tasks/:taskId', updateTaskStatus)
router.post('/tasks', authorize('admin', 'manager'), createTask)
router.get('/officer/:officerId', authorize('admin', 'manager'), getVisitsByOfficer)

router
  .route('/')
  .get(getVisits)
  .post(uploadVisitPhoto, createVisit)

export default router
