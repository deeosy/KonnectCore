import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "./error.middleware.js";
import { runWithOrg } from "../utils/tenant.js";

// Verifies the JWT on every authenticated request and attaches the full user
// document (minus password) to req.user. Reloading the user from the DB on
// each request (rather than trusting the token payload alone) is deliberate:
// a user may have been deactivated or deleted after their token was issued,
// and we want those changes to take effect immediately for existing sessions.
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract the JWT from the standard "Authorization: Bearer <token>" header.
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Not authorized, no token");
    }

    // Decode the token, then reload the user from the DB so deactivation and
    // account deletion take effect immediately (see header comment above).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account is deactivated");
    }

    // Downstream middleware/controllers use req.user for the current actor.
    req.user = user;

    // Run the rest of the request inside the user's tenant context. The
    // tenantScope schema plugin reads this store to auto-scope every query to
    // the user's organisation and to stamp organisationId on any document they
    // create — the enforcement point for multi-tenant isolation.
    runWithOrg(user.organisationId ?? null, () => next());
  } catch (error) {
    // Normalize invalid/expired-token signals from jsonwebtoken into a single
    // 401 message, and pass any other error through unchanged.
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
// user's role (from req.user) must match. This gates on the static role.
// Tenant-level data scoping is automatic — the protect middleware runs the
// request inside an organisation context which the tenantScope schema plugin
// applies to every query (see models/plugins/tenantScope.js).
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Returns a middleware that rejects the request if the current user's
    // role is not one of the allowed roles for this route.
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
