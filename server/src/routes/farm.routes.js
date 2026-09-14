// Farm routes — mount path: /api/farms
// Only authentication is enforced (router.use(protect)) — no role gate here,
// so any authenticated user can manage farms and their crops. Sub-resource
// routes are nested under /member/:memberId.

import { Router } from 'express'
import {
  getFarms,
  getFarm,
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

// GET /api/farms - list all farms
router.get('/', getFarms)
// GET /api/farms/member/:memberId - farms belonging to one member
router.get('/member/:memberId', getFarmByMember)
// POST /api/farms/member/:memberId - create a farm for a member
router.post('/member/:memberId', createFarm)
// POST /api/farms/member/:memberId/crops - add a crop to a member's farm
router.post('/member/:memberId/crops', addCrop)
// PUT /api/farms/member/:memberId/crops/:cropId - update a farm crop
router.put('/member/:memberId/crops/:cropId', updateCrop)
// DELETE /api/farms/member/:memberId/crops/:cropId - remove a farm crop
router.delete('/member/:memberId/crops/:cropId', deleteCrop)
// GET /api/farms/:id - single farm detail
router.get('/:id', getFarm)
// PUT /api/farms/:id - update a farm
router.put('/:id', updateFarm)
// DELETE /api/farms/:id - delete a farm
router.delete('/:id', deleteFarm)

export default router
