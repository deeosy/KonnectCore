import { Router } from 'express'
import {
  getStats,
  getRecentActivity,
  getCollectionTrend,
  getPaymentBreakdown,
  getMemberDistribution,
  getMemberGrowth,
} from '../controllers/dashboard.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/stats', getStats)
router.get('/activity', getRecentActivity)
router.get('/collection-trend', getCollectionTrend)
router.get('/payment-breakdown', getPaymentBreakdown)
router.get('/member-distribution', getMemberDistribution)
router.get('/member-growth', getMemberGrowth)

export default router
