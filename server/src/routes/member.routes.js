import { Router } from 'express'
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  attachDocument,
  removeDocument,
} from '../controllers/member.controller.js'
import { importMembers, exportMembers } from '../controllers/import.controller.js'
import { getMemberHistory } from '../controllers/history.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import {
  uploadMemberPhoto,
  uploadMemberDocument,
  uploadCsv,
} from '../middleware/upload.middleware.js'

const router = Router()

router.use(protect)

router.get('/import/template', authorize('admin', 'manager'), (req, res, next) => {
  import('xlsx')
    .then(async (XLSX) => {
      const headers = [
        'firstName',
        'lastName',
        'phone',
        'membershipNumber',
        'location',
        'region',
        'district',
        'status',
        'farmSize',
        'mainCrops',
      ]
      const ws = XLSX.utils.json_to_sheet([
        Object.fromEntries(headers.map((h) => [h, ''])),
      ])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Members')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="member-import-template.xlsx"'
      )
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.send(buf)
    })
    .catch(next)
})

router
  .route('/')
  .get(getMembers)
  .post(authorize('admin', 'manager', 'fieldOfficer'), uploadMemberPhoto, createMember)

router.post('/import', authorize('admin', 'manager'), uploadCsv, importMembers)
router.get('/export', authorize('admin', 'manager'), exportMembers)
router.get('/:id/history', getMemberHistory)

router
  .route('/:id')
  .get(getMember)
  .put(authorize('admin', 'manager', 'fieldOfficer'), uploadMemberPhoto, updateMember)
  .delete(authorize('admin'), deleteMember)

router.post(
  '/:id/documents',
  authorize('admin', 'manager', 'fieldOfficer'),
  uploadMemberDocument,
  attachDocument
)
router.delete(
  '/:id/documents/:docId',
  authorize('admin', 'manager'),
  removeDocument
)

export default router
