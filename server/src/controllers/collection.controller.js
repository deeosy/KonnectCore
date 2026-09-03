import Collection from '../models/Collection.js'
import Batch from '../models/Batch.js'
import Member from '../models/Member.js'
import Group from '../models/Group.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getCollections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const { crop, memberId, groupId, batchId, from, to } = req.query

    const filter = {}
    if (crop) filter.crop = { $regex: crop, $options: 'i' }
    if (memberId) filter.memberId = memberId
    if (batchId) filter.batchId = batchId

    let memberFilter = null
    if (groupId) {
      const members = await Member.find({ groupId }).select('_id')
      memberFilter = { memberId: { $in: members.map((m) => m._id) } }
    }

    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = new Date(from)
      if (to) filter.date.$lte = new Date(to)
    }

    const combined = { ...filter, ...memberFilter }
    const skip = (page - 1) * limit
    const total = await Collection.countDocuments(combined)

    const collections = await Collection.find(combined)
      .populate('memberId', 'firstName lastName phone membershipNumber')
      .populate('capturedBy', 'name')
      .populate('batchId', 'batchNumber')
      .sort('-date')
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      count: collections.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: collections,
    })
  } catch (error) {
    next(error)
  }
}

export const getCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('memberId', 'firstName lastName phone membershipNumber groupId')
      .populate('capturedBy', 'name')
    if (!collection) throw new ApiError(404, 'Collection not found')
    res.json({ success: true, data: collection })
  } catch (error) {
    next(error)
  }
}

export const createCollection = async (req, res, next) => {
  try {
    const data = { ...req.body, capturedBy: req.user._id }

    if (req.file) {
      data.photo = `/uploads/collections/${req.file.filename}`
    }

    const price =
      data.pricePerUnit ||
      req.user.settings?.defaultPrices?.[data.crop] ||
      0
    data.pricePerUnit = price
    data.totalValue = (data.quantity || 0) * price

    const collection = await Collection.create(data)
    res.status(201).json({ success: true, data: collection })
  } catch (error) {
    next(error)
  }
}

export const updateCollection = async (req, res, next) => {
  try {
    let data = { ...req.body }
    if (req.file) data.photo = `/uploads/collections/${req.file.filename}`

    const existing = await Collection.findById(req.params.id)
    if (!existing) throw new ApiError(404, 'Collection not found')

    const qty = data.quantity !== undefined ? data.quantity : existing.quantity
    const price = data.pricePerUnit !== undefined ? data.pricePerUnit : existing.pricePerUnit
    data.totalValue = qty * price

    const collection = await Collection.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    })
    res.json({ success: true, data: collection })
  } catch (error) {
    next(error)
  }
}

export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id)
    if (!collection) throw new ApiError(404, 'Collection not found')
    res.json({ success: true, message: 'Collection removed' })
  } catch (error) {
    next(error)
  }
}

export const addToBatch = async (req, res, next) => {
  try {
    const { collectionIds, batchNumber } = req.body
    let batch = await Batch.findOne({ batchNumber })

    if (!batch) {
      batch = await Batch.create({
        batchNumber,
        status: 'open',
        createdBy: req.user._id,
      })
    }

    const result = await Collection.updateMany(
      { _id: { $in: collectionIds } },
      { batchId: batch._id, batchNumber: batch.batchNumber }
    )

    const weight = await Collection.aggregate([
      { $match: { batchId: batch._id } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ])
    batch.totalWeight = weight[0]?.total || 0
    await batch.save()

    res.json({ success: true, message: 'Collections added to batch', data: batch })
  } catch (error) {
    next(error)
  }
}

export const getBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find()
      .populate('createdBy', 'name')
      .sort('-createdAt')
    res.json({ success: true, count: batches.length, data: batches })
  } catch (error) {
    next(error)
  }
}

export const getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
    if (!batch) throw new ApiError(404, 'Batch not found')
    const collections = await Collection.find({ batchId: batch._id })
      .populate('memberId', 'firstName lastName phone membershipNumber location')
    res.json({ success: true, data: { ...batch.toObject(), collections } })
  } catch (error) {
    next(error)
  }
}
