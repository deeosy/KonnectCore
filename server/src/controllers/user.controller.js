// User management controller (admin CRUD). Lists, creates, updates, and
// deletes platform users. All responses exclude the password hash.
import User from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";

// GET /api/users
// Lists all users (newest first). Excludes password hash.
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
// Returns a single user by id, sans password hash.
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw new ApiError(404, "User not found");
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Users created through the admin UI always start with the same default
// password. The client surface shows "Default password: password123" so new
// staff know what to use; there is no forced-change-on-first-login flow yet,
// which should be added before this moves to non-MVP production use.
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, assignedArea } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      throw new ApiError(400, "User with this email already exists");

    const user = await User.create({
      name,
      email,
      password: password || "password123",
      phone,
      role,
      assignedArea,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id
// Partial update of name/email/phone/role/assignedArea/isActive. When a
// password is included it is re-hashed by the model pre-save hook on save().
// This is why save() is used instead of findByIdAndUpdate — passthrough
// updates bypass the pre-save hasher and would store plaintext passwords.
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    const { name, email, phone, role, assignedArea, isActive, password } =
      req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.role = role || user.role;
    user.assignedArea =
      assignedArea !== undefined ? assignedArea : user.assignedArea;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    if (password) {
      user.password = password;
    }

    const updated = await user.save();
    res.json({
      success: true,
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        assignedArea: updated.assignedArea,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Prevent an admin from deleting their own account mid-session. This is a
// safety check — if it were possible, a single admin could lock themselves
// out of the system with no way to recover without DB access.
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    if (user._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, "You cannot delete your own account");
    }
    await user.deleteOne();
    res.json({ success: true, message: "User removed" });
  } catch (error) {
    next(error);
  }
};
