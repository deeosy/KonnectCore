// User model — staff accounts for authentication and role-based access control.
// Used by auth controllers (register, login), admin user management, and as a
// reference in audit logs, field officer assignments, and collection capture.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import tenantScope from "./plugins/tenantScope.js";

const userSchema = new mongoose.Schema(
  {
    // -- Core identity --
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // -- Authentication credentials --
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Hashed via pre-save hook below; never stored in plain text.
    },
    phone: {
      type: String,
      trim: true,
    },
    // -- Role-based access control --
    role: {
      type: String,
      enum: ["admin", "manager", "fieldOfficer"],
      default: "fieldOfficer",
    },
    assignedArea: {
      type: String,
      trim: true,
    },
    // -- Tenant ownership --
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    photo: {
      type: String,
    },
    // Soft-delete flag; inactive users cannot log in but records are retained.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash the password on save, but only when it was actually changed.
// The isModified guard prevents re-hashing on every document update
// (e.g. when an admin toggles isActive or changes the role), which
// would otherwise make the stored hash unusable for comparison.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tenant isolation (see plugin comment for details).
userSchema.plugin(tenantScope);

const User = mongoose.model("User", userSchema);

export default User;
