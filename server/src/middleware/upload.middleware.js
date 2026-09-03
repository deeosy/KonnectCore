import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true })
}

const createStorage = (folder) => {
  const uploadDir = path.join(__dirname, '../../uploads', folder)
  ensureDir(uploadDir)

  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDir)
    },
    filename(req, file, cb) {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      const ext = path.extname(file.originalname)
      cb(null, `${unique}${ext}`)
    },
  })
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|csv/
  const ext = path.extname(file.originalname).toLowerCase().slice(1)
  if (!allowed.test(ext)) {
    return cb(new Error('File type not allowed'))
  }
  cb(null, true)
}

const upload = (folder) =>
  multer({
    storage: createStorage(folder),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  })

export const uploadMemberPhoto = upload('members').single('photo')
export const uploadMemberDocument = upload('documents').single('document')
export const uploadCollectionPhoto = upload('collections').single('photo')
export const uploadVisitPhoto = upload('visits').single('photo')
export const uploadVisitPhotos = upload('visits').array('photos', 5)
export const uploadCsv = upload('members').single('file')
