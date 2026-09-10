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
import { audit } from '../utils/audit.js'

const router = Router()

router.use(protect)

router.get('/batches', getBatches)
router.patch('/batches/:id', authorize('admin', 'manager'), audit('update', 'batch', { resourceIdFrom: (req) => req.params.id }), updateBatch)
router.put('/batches/:id', authorize('admin', 'manager'), audit('update', 'batch', { resourceIdFrom: (req) => req.params.id }), updateBatch)
router.get('/batches/:id', getBatch)
router.delete('/batches/:id', authorize('admin', 'manager'), audit('delete', 'batch', { resourceIdFrom: (req) => req.params.id }), deleteBatch)

router
  .route('/')
  .get(getCollections)
  .post(authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'collection'), uploadCollectionPhoto, createCollection)

router
  .route('/:id')
  .get(getCollection)
  .put(authorize('admin', 'manager', 'fieldOfficer'), audit('update', 'collection'), uploadCollectionPhoto, updateCollection)
  .delete(authorize('admin', 'manager'), audit('delete', 'collection'), deleteCollection)

router.post('/batch/add', authorize('admin', 'manager'), audit('batch_add', 'collection'), addToBatch)

export default router
