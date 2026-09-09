import Crop from "../models/Crop.js";
import { ApiError } from "../middleware/error.middleware.js";

export const getCrops = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active === "true") filter.isActive = true;

    const crops = await Crop.find(filter).sort("sortOrder name");
    res.json({ success: true, count: crops.length, data: crops });
  } catch (error) {
    next(error);
  }
};

export const createCrop = async (req, res, next) => {
  try {
    const crop = await Crop.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    // Handle duplicate key (unique name) with a clean client-facing message.
    if (error.code === 11000) {
      return next(new ApiError(400, "A crop with this name already exists"));
    }
    next(error);
  }
};

export const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!crop) throw new ApiError(404, "Crop not found");
    res.json({ success: true, data: crop });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, "A crop with this name already exists"));
    }
    next(error);
  }
};

export const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);
    if (!crop) throw new ApiError(404, "Crop not found");
    res.json({ success: true, message: "Crop removed" });
  } catch (error) {
    next(error);
  }
};