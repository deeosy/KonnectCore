// Dashboard routes — mount path: /api/dashboard
// Authentication-only (router.use(protect)) — no role gate. These endpoints
// power the dashboard widgets: headline stats, recent activity, and the
// collection/payment/member chart series.

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

// GET /api/dashboard/stats - headline counts (members, collections, value, etc.)
router.get('/stats', getStats)
// GET /api/dashboard/activity - recent activity feed
router.get('/activity', getRecentActivity)
// GET /api/dashboard/collection-trend - collection amounts over time
router.get('/collection-trend', getCollectionTrend)
// GET /api/dashboard/payment-breakdown - payment split (cash vs produce, etc.)
router.get('/payment-breakdown', getPaymentBreakdown)
// GET /api/dashboard/member-distribution - members by group/region/status
router.get('/member-distribution', getMemberDistribution)
// GET /api/dashboard/member-growth - member count over time
router.get('/member-growth', getMemberGrowth)

export default router
