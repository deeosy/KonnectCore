import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const createStorage = (folder) => {
  const uploadDir = path.join(__dirname, "../../uploads", folder);
  ensureDir(uploadDir);

  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDir);
    },
    filename(req, file, cb) {
      // Time + random suffix guarantees uniqueness even when two users upload
      // same-named files in the same second. The original filename is not
      // preserved to avoid path traversal and encoding issues — we keep the
      // original name in the DB document for display purposes instead.
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });
};

// Whitelist-based file extension check. Rejecting everything not on this list
// is safer than a blacklist of dangerous types — the system only accepts
// common document and image formats, never executables or scripts.
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|csv/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (!allowed.test(ext)) {
    return cb(new Error("File type not allowed"));
  }
  cb(null, true);
};

// 10 MB per file cap. Files that exceed this are rejected by multer during
// upload — sufficient for member photos and produce snapshots, and prevents
// a single request from consuming excessive disk or memory.
const upload = (folder) =>
  multer({
    storage: createStorage(folder),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

export const uploadMemberPhoto = upload("members").single("photo");
export const uploadMemberDocument = upload("documents").single("document");
export const uploadCollectionPhoto = upload("collections").single("photo");
export const uploadVisitPhoto = upload("visits").single("photo");
export const uploadVisitPhotos = upload("visits").array("photos", 5);
export const uploadCsv = upload("members").single("file");
