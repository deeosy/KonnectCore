import Member from '../models/Member.js'
import Group from '../models/Group.js'

const normalizeRow = (row, orgId) => {
  const firstName = row.firstName || row.first_name || row.name || ''
  const names = firstName.split(' ')
  const member = {
    organisationId: orgId,
    firstName: names[0] || firstName,
    lastName: row.lastName || row.last_name || names.slice(1).join(' ') || '',
    phone: String(row.phone || row.mobile || '').trim(),
    membershipNumber: String(row.membershipNumber || row.member_no || row.membership_no || '')
      .trim(),
    location: row.location || '',
    region: row.region || '',
    district: row.district || '',
    status: ['active', 'inactive', 'suspended', 'blacklisted'].includes(row.status)
      ? row.status
      : 'active',
    farmSize: row.farmSize ? Number(row.farmSize) : undefined,
    mainCrops: row.mainCrops
      ? String(row.mainCrops)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [],
  }

  if (!member.membershipNumber) {
    member.membershipNumber = `KC-${Date.now().toString().slice(-6)}${Math.floor(
      Math.random() * 100
    )}`
  }

  return member
}

const validateRow = (row, index) => {
  const errors = []
  const firstName = row.firstName || row.first_name || row.name || ''
  if (!firstName.trim()) {
    errors.push(`Row ${index + 1}: First name is required`)
  }
  return errors
}

export const importMembers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const XLSX = await import('xlsx')
    const workbook = XLSX.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'File is empty' })
    }

    const orgId = req.body.organisationId || req.user.organisationId

    const validationErrors = []
    const validMembers = []

    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index)
      if (rowErrors.length > 0) {
        validationErrors.push(...rowErrors)
      } else {
        validMembers.push(normalizeRow(row, orgId))
      }
    })

    if (validationErrors.length > 0 && validMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All rows failed validation',
        errors: validationErrors,
      })
    }

    let inserted = []
    if (validMembers.length > 0) {
      inserted = await Member.insertMany(validMembers, { ordered: false }).catch((err) => {
        if (err.writeErrors) {
          return err.insertedDocs
        }
        throw err
      })
    }

    res.status(201).json({
      success: true,
      message: `Imported ${inserted.length} members`,
      count: inserted.length,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      data: inserted.slice(0, 100),
    })
  } catch (error) {
    next(error)
  }
}

export const exportMembers = async (req, res, next) => {
  try {
    const filter = {}
    const { search, status, groupId, crop } = req.query

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { membershipNumber: { $regex: search, $options: 'i' } },
      ]
    }
    if (status) filter.status = status
    if (groupId) filter.groupId = groupId
    if (crop) filter.mainCrops = { $in: [crop] }

    const members = await Member.find(filter).populate('groupId', 'name').lean()

    const data = members.map((m) => ({
      FirstName: m.firstName,
      LastName: m.lastName,
      Phone: m.phone,
      MembershipNumber: m.membershipNumber,
      Location: m.location,
      Region: m.region,
      District: m.district,
      Status: m.status,
      Group: m.groupId?.name || '',
      FarmSize: m.farmSize ?? '',
      MainCrops: (m.mainCrops || []).join(', '),
      CreatedAt: m.createdAt,
    }))

    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Members')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Disposition', 'attachment; filename="members.xlsx"')
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.send(buf)
  } catch (error) {
    next(error)
  }
}
