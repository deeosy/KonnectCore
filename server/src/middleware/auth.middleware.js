import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "./error.middleware.js";

// Verifies the JWT on every authenticated request and attaches the full user
// document (minus password) to req.user. Reloading the user from the DB on
// each request (rather than trusting the token payload alone) is deliberate:
// a user may have been deactivated or deleted after their token was issued,
// and we want those changes to take effect immediately for existing sessions.
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account is deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new ApiError(401, "Not authorized, invalid token"));
    }
    next(error);
  }
};

// Role-based access control. Pass one or more allowed roles; the current
// user's role (from req.user) must match. This only gates on the static
// role — it does not scope data to an organisation, so any additional
// tenant-level checks must be enforced in the controller.
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role ${req.user.role} is not authorized to access this resource`,
        ),
      );
    }
    next();
  };
};
