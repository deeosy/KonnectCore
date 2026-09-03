import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ApiError } from './error.middleware.js'

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      throw new ApiError(401, 'User not found')
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is deactivated')
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Not authorized, invalid token'))
    }
    next(error)
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role ${req.user.role} is not authorized to access this resource`)
      )
    }
    next()
  }
}
