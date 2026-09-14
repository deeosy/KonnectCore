// Member routes — mount path: /api/members
// All endpoints require an authenticated user (router.use(protect)).
// Field officers can create/update members and attach documents; deletes and
// bulk import/export are restricted to admins/managers, deletes to admins.
// Mutations are audited, and photo/document uploads flow through multer.

import { Router } from 'express'
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  restoreMember,
  attachDocument,
  removeDocument,
} from '../controllers/member.controller.js'
import { importMembers, exportMembers } from '../controllers/import.controller.js'
import { getMemberHistory } from '../controllers/history.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { audit } from '../utils/audit.js'
import {
  uploadMemberPhoto,
  uploadMemberDocument,
  uploadCsv,
} from '../middleware/upload.middleware.js'

const router = Router()

router.use(protect)

// GET /api/members/import/template - download an Excel template for bulk import (admin/manager)
router.get('/import/template', authorize('admin', 'manager'), (req, res, next) => {
  import('xlsx')
    .then(async (mod) => {
      const XLSX = mod.default ?? mod
      // Builds a one-row workbook whose headers mirror the import fields, so
      // officers can fill it in offline and upload via POST /import.
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

// GET /api/members - list members; POST - create member (admin/manager/fieldOfficer,
// audited, accepts a photo upload retained in memory for later persistence)
router
  .route('/')
  .get(getMembers)
  .post(authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'member'), uploadMemberPhoto, createMember)

// POST /api/members/import - bulk import from CSV (admin/manager, audited)
router.post('/import', authorize('admin', 'manager'), audit('import', 'member'), uploadCsv, importMembers)
// GET /api/members/export - export all members to file (admin/manager)
router.get('/export', authorize('admin', 'manager'), exportMembers)
// GET /api/members/:id/history - audit/activity trail for one member
router.get('/:id/history', getMemberHistory)

// GET /api/members/:id - member detail; PUT - update (admin/manager/fieldOfficer,
// audited, photo upload); DELETE - remove (admin, audited, soft delete)
router
  .route('/:id')
  .get(getMember)
  .put(authorize('admin', 'manager', 'fieldOfficer'), audit('update', 'member'), uploadMemberPhoto, updateMember)
  .delete(authorize('admin'), audit('delete', 'member'), deleteMember)

// POST /api/members/:id/restore - reverse a soft delete (admin, audited)
router.post('/:id/restore', authorize('admin'), audit('restore', 'member'), restoreMember)

// POST /api/members/:id/documents - attach a document to a member
// (admin/manager/fieldOfficer, audited, multipart single-file upload)
router.post(
  '/:id/documents',
  authorize('admin', 'manager', 'fieldOfficer'),
  audit('attach_document', 'member', { resourceIdFrom: (req) => req.params.id }),
  uploadMemberDocument,
  attachDocument
)
// DELETE /api/members/:id/documents/:docId - remove an attached document (admin/manager, audited)
router.delete(
  '/:id/documents/:docId',
  authorize('admin', 'manager'),
  audit('remove_document', 'member', { resourceIdFrom: (req) => req.params.id }),
  removeDocument
)

export default router
