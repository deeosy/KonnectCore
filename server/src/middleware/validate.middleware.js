import { validationResult } from 'express-validator'
import { ApiError } from './error.middleware.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg)
    return next(new ApiError(400, messages.join(', ')))
  }
  next()
}
