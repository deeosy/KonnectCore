import { Router } from 'express'
import {
  getFarmByMember,
  createFarm,
  updateFarm,
  deleteFarm,
  addCrop,
  updateCrop,
  deleteCrop,
} from '../controllers/farm.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/member/:memberId', getFarmByMember)
router.post('/member/:memberId', createFarm)
router.post('/member/:memberId/crops', addCrop)
router.put('/member/:memberId/crops/:cropId', updateCrop)
router.delete('/member/:memberId/crops/:cropId', deleteCrop)
router.put('/:id', updateFarm)
router.delete('/:id', deleteFarm)

export default router
