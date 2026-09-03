import FieldVisit from '../models/FieldVisit.js'
import Member from '../models/Member.js'
import Task from '../models/Task.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getVisits = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.memberId) filter.memberId = req.query.memberId
    if (req.user.role === 'fieldOfficer') filter.officerId = req.user._id
    if (req.query.officerId) filter.officerId = req.query.officerId

    const visits = await FieldVisit.find(filter)
      .populate('memberId', 'firstName lastName phone membershipNumber photo')
      .populate('officerId', 'name')
      .sort('-date')

    res.json({ success: true, count: visits.length, data: visits })
  } catch (error) {
    next(error)
  }
}

export const createVisit = async (req, res, next) => {
  try {
    const data = { ...req.body, officerId: req.user._id }
    if (req.file || req.files) {
      const files = req.files && req.files.length ? req.files : req.file ? [req.file] : []
      data.photos = files.map((f) => `/uploads/visits/${f.filename}`)
    }
    const visit = await FieldVisit.create(data)
    res.status(201).json({ success: true, data: visit })
  } catch (error) {
    next(error)
  }
}

export const getVisitsByOfficer = async (req, res, next) => {
  try {
    const visits = await FieldVisit.find({ officerId: req.params.officerId })
      .populate('memberId', 'firstName lastName membershipNumber photo')
      .sort('-date')
    res.json({ success: true, count: visits.length, data: visits })
  } catch (error) {
    next(error)
  }
}

export const getMyAssignedMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ assignedOfficerId: req.user._id })
      .populate('groupId', 'name')
      .sort('-createdAt')
    res.json({ success: true, count: members.length, data: members })
  } catch (error) {
    next(error)
  }
}

export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('memberId', 'firstName lastName phone membershipNumber')
      .sort('-createdAt')
    res.json({ success: true, count: tasks.length, data: tasks })
  } catch (error) {
    next(error)
  }
}

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status: req.body.status },
      { new: true }
    )
    if (!task) throw new ApiError(404, 'Task not found')
    res.json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    })
    res.status(201).json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}

export const getOfficerPerformance = async (req, res, next) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - (Number(req.query.days) || 7))

    const performance = await FieldVisit.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: '$officerId',
          visits: { $sum: 1 },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'officer' } },
      { $unwind: '$officer' },
      { $project: { _id: 1, visits: 1, name: '$officer.name', role: '$officer.role' } },
    ])

    res.json({ success: true, since, data: performance })
  } catch (error) {
    next(error)
  }
}
