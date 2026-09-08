import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";

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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "fieldOfficer",
    });

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

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

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
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
