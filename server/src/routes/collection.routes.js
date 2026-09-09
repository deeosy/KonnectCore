import { Router } from 'express'
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addToBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
} from '../controllers/collection.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { uploadCollectionPhoto } from '../middleware/upload.middleware.js'

const router = Router()

router.use(protect)

router.get('/batches', getBatches)
router.patch('/batches/:id', authorize('admin', 'manager'), updateBatch)
router.put('/batches/:id', authorize('admin', 'manager'), updateBatch)
router.get('/batches/:id', getBatch)
router.delete('/batches/:id', authorize('admin', 'manager'), deleteBatch)

router
  .route('/')
  .get(getCollections)
  .post(authorize('admin', 'manager', 'fieldOfficer'), uploadCollectionPhoto, createCollection)

router
  .route('/:id')
  .get(getCollection)
  .put(authorize('admin', 'manager', 'fieldOfficer'), uploadCollectionPhoto, updateCollection)
  .delete(authorize('admin', 'manager'), deleteCollection)

router.post('/batch/add', authorize('admin', 'manager'), addToBatch)

export default router
