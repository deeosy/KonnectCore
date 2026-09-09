import Organisation from '../models/Organisation.js'
import { ApiError } from '../middleware/error.middleware.js'

export const getOrganisations = async (req, res, next) => {
  try {
    const organisations = await Organisation.find().sort('-createdAt')
    res.json({ success: true, count: organisations.length, data: organisations })
  } catch (error) {
    next(error)
  }
}

// Returns just the settings of the requesting user's own organisation. This is
// used by the client to drive dropdown options (crops, quality grades,
// seasons) and to auto-fill the default crop price on collection forms.
export const getOrgSettings = async (req, res, next) => {
  try {
    let org = null
    if (req.user.organisationId) {
      org = await Organisation.findById(req.user.organisationId)
    }

    const defaults = { currency: 'GHS', qualityGrades: ['A', 'B', 'C'], seasons: ['Major', 'Minor'] }
    res.json({
      success: true,
      data: {
        currency: org?.settings?.currency || defaults.currency,
        defaultCropPrices: org?.settings?.defaultCropPrices || {},
        qualityGrades: org?.settings?.qualityGrades || defaults.qualityGrades,
        seasons: org?.settings?.seasons || defaults.seasons,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getOrganisation = async (req, res, next) => {
  try {
    const organisation = await Organisation.findById(req.params.id)
    if (!organisation) throw new ApiError(404, 'Organisation not found')
    res.json({ success: true, data: organisation })
  } catch (error) {
    next(error)
  }
}

export const createOrganisation = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user._id }
    const organisation = await Organisation.create(data)
    res.status(201).json({ success: true, data: organisation })
  } catch (error) {
    next(error)
  }
}

export const updateOrganisation = async (req, res, next) => {
  try {
    const organisation = await Organisation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!organisation) throw new ApiError(404, 'Organisation not found')
    res.json({ success: true, data: organisation })
  } catch (error) {
    next(error)
  }
}

export const deleteOrganisation = async (req, res, next) => {
  try {
    const organisation = await Organisation.findByIdAndDelete(req.params.id)
    if (!organisation) throw new ApiError(404, 'Organisation not found')
    res.json({ success: true, message: 'Organisation removed' })
  } catch (error) {
    next(error)
  }
}
