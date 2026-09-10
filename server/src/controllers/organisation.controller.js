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

    const defaults = {
      currency: 'GHS',
      qualityGrades: ['A', 'B', 'C'],
      seasons: ['Major', 'Minor'],
    }
    res.json({
      success: true,
      data: {
        currency: org?.settings?.currency || defaults.currency,
        defaultCropPrices: org?.settings?.defaultCropPrices || {},
        qualityGrades: org?.settings?.qualityGrades || defaults.qualityGrades,
        seasons: org?.settings?.seasons || defaults.seasons,
        deductionRules: org?.settings?.deductionRules || {},
      },
    })
  } catch (error) {
    next(error)
  }
}

// Updates the requesting admin's own organisation settings. Each setting is
// validated in isolation: currency must be a 3-letter code, price/deduction
// maps must hold finite numbers, and grades/seasons must be non-empty string
// arrays. Invalid keys are rejected; valid ones are merged onto the existing
// settings map.
export const updateOrgSettings = async (req, res, next) => {
  try {
    if (!req.user.organisationId) throw new ApiError(400, 'No organisation assigned')

    const clean = {}
    const { currency, defaultCropPrices, qualityGrades, seasons, deductionRules } = req.body || {}

    if (currency !== undefined) {
      if (!/^[A-Za-z]{3}$/.test(String(currency).trim()))
        throw new ApiError(400, 'Currency must be a 3-letter code (e.g. GHS)')
      clean.currency = String(currency).trim().toUpperCase()
    }

    if (defaultCropPrices !== undefined) {
      if (typeof defaultCropPrices !== 'object' || Array.isArray(defaultCropPrices))
        throw new ApiError(400, 'defaultCropPrices must be a crop-to-price object')
      const mapped = {}
      for (const [crop, price] of Object.entries(defaultCropPrices)) {
        if (crop && Number.isFinite(Number(price)) && Number(price) >= 0)
          mapped[crop] = Number(price)
      }
      clean.defaultCropPrices = mapped
    }

    const cleanStringArray = (value, label) => {
      if (!Array.isArray(value)) throw new ApiError(400, `${label} must be an array`)
      const arr = value
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter(Boolean)
      return [...new Set(arr)]
    }

    if (qualityGrades !== undefined) {
      if (qualityGrades.length === 0)
        throw new ApiError(400, 'At least one quality grade is required')
      clean.qualityGrades = cleanStringArray(qualityGrades, 'qualityGrades')
    }

    if (seasons !== undefined) {
      if (seasons.length === 0) throw new ApiError(400, 'At least one season is required')
      clean.seasons = cleanStringArray(seasons, 'seasons')
    }

    if (deductionRules !== undefined) {
      if (typeof deductionRules !== 'object' || Array.isArray(deductionRules))
        throw new ApiError(400, 'deductionRules must be a label-to-value object')
      const mapped = {}
      for (const [label, value] of Object.entries(deductionRules)) {
        if (label && Number.isFinite(Number(value))) mapped[label] = Number(value)
      }
      clean.deductionRules = mapped
    }

    if (Object.keys(clean).length === 0)
      throw new ApiError(400, 'No valid settings provided')

    const org = await Organisation.findByIdAndUpdate(
      req.user.organisationId,
      { $set: Object.fromEntries(Object.entries(clean).map(([k, v]) => [`settings.${k}`, v])) },
      { new: true, runValidators: true },
    )
    if (!org) throw new ApiError(404, 'Organisation not found')

    res.json({
      success: true,
      data: {
        currency: org.settings.currency,
        defaultCropPrices: org.settings.defaultCropPrices,
        qualityGrades: org.settings.qualityGrades,
        seasons: org.settings.seasons,
        deductionRules: org.settings.deductionRules,
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
