import FarmProfile from '../models/FarmProfile.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getFarmByMember = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findOne({ memberId: req.params.memberId })
    if (!farm) throw new ApiError(404, 'Farm profile not found')
    res.json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}

export const createFarm = async (req, res, next) => {
  try {
    const farm = await FarmProfile.create(req.body)
    res.status(201).json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}

export const updateFarm = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!farm) throw new ApiError(404, 'Farm profile not found')
    res.json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}

export const deleteFarm = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findByIdAndDelete(req.params.id)
    if (!farm) throw new ApiError(404, 'Farm profile not found')
    res.json({ success: true, message: 'Farm profile removed' })
  } catch (error) {
    next(error)
  }
}

export const addCrop = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findOne({ memberId: req.params.memberId })
    if (!farm) {
      const created = await FarmProfile.create({
        memberId: req.params.memberId,
        crops: [req.body],
      })
      return res.status(201).json({ success: true, data: created })
    }
    farm.crops.push(req.body)
    await farm.save()
    res.json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}

export const updateCrop = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findOne({ memberId: req.params.memberId })
    if (!farm) throw new ApiError(404, 'Farm profile not found')

    const crop = farm.crops.id(req.params.cropId)
    if (!crop) throw new ApiError(404, 'Crop not found')

    Object.assign(crop, req.body)
    await farm.save()
    res.json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}

export const deleteCrop = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findOne({ memberId: req.params.memberId })
    if (!farm) throw new ApiError(404, 'Farm profile not found')

    farm.crops.pull(req.params.cropId)
    await farm.save()
    res.json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}
