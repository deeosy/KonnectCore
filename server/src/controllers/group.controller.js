import Group from '../models/Group.js'
import Member from '../models/Member.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getGroups = async (req, res, next) => {
  try {
    const { hierarchy } = req.query
    const groups = await Group.find()
      .populate('leaderId', 'name role')
      .sort('name')

    if (hierarchy === 'true') {
      const withCounts = await Promise.all(
        groups.map(async (g) => ({
          ...g.toObject(),
          memberCount: await Member.countDocuments({ groupId: g._id }),
        }))
      )
      return res.json({ success: true, count: withCounts.length, data: withCounts })
    }

    res.json({ success: true, count: groups.length, data: groups })
  } catch (error) {
    next(error)
  }
}

export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('leaderId', 'name role')
    if (!group) throw new ApiError(404, 'Group not found')

    const members = await Member.find({ groupId: group._id })
      .select('firstName lastName phone membershipNumber status photo')
      .populate('assignedOfficerId', 'name')

    const children = await Group.find({ parentId: group._id }).select('name type')

    res.json({
      success: true,
      data: {
        ...group.toObject(),
        members,
        memberCount: members.length,
        children,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const createGroup = async (req, res, next) => {
  try {
    const group = await Group.create({
      ...req.body,
      createdBy: req.user._id,
    })
    res.status(201).json({ success: true, data: group })
  } catch (error) {
    next(error)
  }
}

export const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!group) throw new ApiError(404, 'Group not found')
    res.json({ success: true, data: group })
  } catch (error) {
    next(error)
  }
}

export const deleteGroup = async (req, res, next) => {
  try {
    await Member.updateMany({ groupId: req.params.id }, { $unset: { groupId: '' } })
    const group = await Group.findByIdAndDelete(req.params.id)
    if (!group) throw new ApiError(404, 'Group not found')
    res.json({ success: true, message: 'Group removed' })
  } catch (error) {
    next(error)
  }
}

export const assignMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const { memberIds } = req.body

    const group = await Group.findById(groupId)
    if (!group) throw new ApiError(404, 'Group not found')

    if (!Array.isArray(memberIds) || !memberIds.length) {
      throw new ApiError(400, 'memberIds array is required')
    }

    const result = await Member.updateMany(
      { _id: { $in: memberIds } },
      { groupId: group._id }
    )

    res.json({ success: true, message: 'Members assigned', modified: result.modifiedCount })
  } catch (error) {
    next(error)
  }
}

export const getGroupMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ groupId: req.params.groupId })
      .select('firstName lastName phone membershipNumber status photo mainCrops')
    res.json({ success: true, count: members.length, data: members })
  } catch (error) {
    next(error)
  }
}
