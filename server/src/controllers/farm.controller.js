import FarmProfile from '../models/FarmProfile.js'
import Member from '../models/Member.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getFarms = async (req, res, next) => {
  try {
    const { search, crop, status, groupId, location } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // Farms belong to members, so member-level filters (search text, group)
    // are resolved to a set of member ids before querying farm profiles.
    const memberFilter = {}
    if (groupId) {
      memberFilter.groupId = groupId
    }
    if (search) {
      memberFilter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { membershipNumber: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
    }

    const memberIds = await Member.find(memberFilter).select('_id')
    const filter = { memberId: { $in: memberIds.map((m) => m._id) } }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }

    if (crop) {
      filter.crops = { $elemMatch: { cropName: { $regex: crop, $options: 'i' } } }
    }

    if (status) {
      filter.crops = { $elemMatch: { status } }
    }

    const skip = (page - 1) * limit
    const total = await FarmProfile.countDocuments(filter)

    const farms = await FarmProfile.find(filter)
      .populate({
        path: 'memberId',
        select: 'firstName lastName phone membershipNumber photo location groupId',
        populate: { path: 'groupId', select: 'name' },
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      count: farms.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: farms,
    })
  } catch (error) {
    next(error)
  }
}

export const getFarm = async (req, res, next) => {
  try {
    const farm = await FarmProfile.findById(req.params.id).populate({
      path: 'memberId',
      select: 'firstName lastName phone membershipNumber photo location groupId',
      populate: { path: 'groupId', select: 'name' },
    })
    if (!farm) throw new ApiError(404, 'Farm profile not found')
    res.json({ success: true, data: farm })
  } catch (error) {
    next(error)
  }
}

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
    // memberId comes from the URL (/farms/member/:memberId) and is merged in
    // here rather than accepted from the body, so a farm can only ever be
    // created for the member that was requested.
    const farm = await FarmProfile.create({
      ...req.body,
      memberId: req.params.memberId,
    })
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
