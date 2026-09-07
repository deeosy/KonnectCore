import { validationResult } from "express-validator";
import { ApiError } from "./error.middleware.js";

// Runs after express-validator rules defined on a route. If any rule failed,
// we shortcut to the error handler (via next) rather than proceeding to the
// controller. All validation error messages are joined into a single string
// so the client gets one combined message instead of an array.
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, messages.join(", ")));
  }
  next();
};
