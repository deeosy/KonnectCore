// Collection routes — mount path: /api/collections
// All endpoints require an authenticated user (router.use(protect)).
// Field officers can create/update collections (with photo upload); batch
// management and deletes are admin/manager. All mutations are audited.

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

// Batch sub-resource routes — listed before /:id so "batches" is never treated as an id.
// GET /api/collections/batches - list all batches
router.get('/batches', getBatches)
// PATCH / PUT /api/collections/batches/:id - update a batch (admin/manager, audited)
router.patch('/batches/:id', authorize('admin', 'manager'), audit('update', 'batch', { resourceIdFrom: (req) => req.params.id }), updateBatch)
router.put('/batches/:id', authorize('admin', 'manager'), audit('update', 'batch', { resourceIdFrom: (req) => req.params.id }), updateBatch)
// GET /api/collections/batches/:id - single batch detail
router.get('/batches/:id', getBatch)
// DELETE /api/collections/batches/:id - delete a batch (admin/manager, audited)
router.delete('/batches/:id', authorize('admin', 'manager'), audit('delete', 'batch', { resourceIdFrom: (req) => req.params.id }), deleteBatch)

// GET /api/collections - list collections; POST - create (admin/manager/fieldOfficer,
// audited, accepts photo upload retained in memory for later persistence)
router
  .route('/')
  .get(getCollections)
  .post(authorize('admin', 'manager', 'fieldOfficer'), audit('create', 'collection'), uploadCollectionPhoto, createCollection)

// GET /api/collections/:id - collection detail; PUT - update (admin/manager/fieldOfficer,
// audited, photo upload); DELETE - remove (admin/manager, audited)
router
  .route('/:id')
  .get(getCollection)
  .put(authorize('admin', 'manager', 'fieldOfficer'), audit('update', 'collection'), uploadCollectionPhoto, updateCollection)
  .delete(authorize('admin', 'manager'), audit('delete', 'collection'), deleteCollection)

// POST /api/collections/batch/add - attach an existing collection to a batch (admin/manager, audited)
router.post('/batch/add', authorize('admin', 'manager'), audit('batch_add', 'collection'), addToBatch)

export default router
