// Auth routes — mount path: /api/auth
// POST /register   - public, create a new user account
// POST /login      - public, authenticate and receive a JWT
// GET  /me          - protected, return the current user's profile

import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, getMe } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

// POST /register — create a new user account; validates name, email, password
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
)

// POST /login — authenticate with email/password, returns JWT
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
)

// GET /me — returns the authenticated user's profile (requires valid JWT)
router.get('/me', protect, getMe)

export default router
