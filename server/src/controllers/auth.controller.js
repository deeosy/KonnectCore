// Authentication controller. Handles self-registration, login, and the
// current-user endpoint. Passwords are hashed by the User model pre-save
// hook (bcrypt). Responses never include the password hash.
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";
import { logAudit } from "../utils/audit.js";

// Creates a signed JWT embedding the user's _id. The token is stateless —
// all authorisation checks rely on the protect middleware decoding it.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Public self-registration. New signups are always field officers — the only
// way to obtain a higher-privilege role is for an admin to promote the user.
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(400, "User with this email already exists");
    }

    // Password is hashed automatically by the User model pre-save hook (bcrypt).
    // Role is forced to fieldOfficer — elevated roles require admin promotion.
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "fieldOfficer",
    });

    // Return a safe subset of user fields — password hash is never sent to the client.
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id),
      },
    });
    // Audit-log the registration event with IP and user context.
    logAudit({
      user,
      action: "register",
      resource: "auth",
      resourceId: user._id,
      summary: `${user.name} registered (${user.email})`,
      details: { email: user.email, role: user.role },
      success: true,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// Deactivated accounts are blocked at login time with a distinct HTTP status
// (403 vs 401) so the client can differentiate "bad credentials" from
// "account locked" messaging. The deactivation also takes effect through the
// protect middleware on already-issued tokens (it re-checks isActive).
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // look up user by email then compare the supplied password against
    // the bcrypt hash stored on the document.
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Deactivated accounts are blocked with 403 (vs 401 for bad creds) so the
    // client can show a distinct message.
    if (!user.isActive) {
      throw new ApiError(
        403,
        "Account is deactivated. Contact an administrator.",
      );
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
        assignedArea: user.assignedArea,
        organisationId: user.organisationId,
        token: generateToken(user._id),
      },
    });
    // Audit-log successful login with IP for traceability.
    logAudit({
      user,
      action: "login",
      resource: "auth",
      resourceId: user._id,
      summary: `${user.name} signed in`,
      details: { email: user.email },
      success: true,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
// Returns the currently authenticated user. The -password projection
// strips the bcrypt hash from the response.
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
