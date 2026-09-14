// One-shot tenant backfill migration.
//
// Before Phase 13, records were created without an organisationId, so the
// tenant-scoping plugin (models/plugins/tenantScope.js) — which filters every
// query by organisationId — would hide pre-existing data from every user.
// This migration assigns the missing/null organisationId on every scoped
// collection to the default tenant (the Seed Cooperative, created if needed)
// and adds an organisationId index for efficient per-tenant queries.
//
// Safe to run repeatedly: documents that already carry an organisationId are
// left untouched; the merge targets only missing/null values.
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../utils/db.js'
import Organisation from '../models/Organisation.js'
import User from '../models/User.js'
import Member from '../models/Member.js'
import Group from '../models/Group.js'
import Collection from '../models/Collection.js'
import Payment from '../models/Payment.js'
import Loan from '../models/Loan.js'
import Expense from '../models/Expense.js'
import FieldVisit from '../models/FieldVisit.js'
import Task from '../models/Task.js'
import FarmProfile from '../models/FarmProfile.js'
import Batch from '../models/Batch.js'
import AuditLog from '../models/AuditLog.js'

dotenv.config()

const SCOPED_MODELS = [
  User,
  Member,
  Group,
  Collection,
  Payment,
  Loan,
  Expense,
  FieldVisit,
  Task,
  FarmProfile,
  Batch,
  AuditLog,
]

async function migrate() {
  await connectDB()

  // Resolve the default tenant (idempotent create keeps reruns safe).
  let org = await Organisation.findOne({
    $or: [{ code: 'KC-COOP' }, { name: 'Sample Cooperative' }],
  })
  if (!org) {
    org = await Organisation.create({
      name: 'Sample Cooperative',
      code: 'KC-COOP',
      location: 'Accra',
      region: 'Greater Accra',
      settings: {
        currency: 'GHS',
        qualityGrades: ['A', 'B', 'C', 'Premium', 'Standard', 'Reject'],
      },
    })
    console.log(`Created default organisation: ${org.name}`)
  }
  console.log(`Default tenant: ${org.name} (${org._id})`)

  const missingFilter = {
    $or: [{ organisationId: { $exists: false } }, { organisationId: null }],
  }

  for (const Model of SCOPED_MODELS) {
    const { modifiedCount } = await Model.updateMany(missingFilter, {
      $set: { organisationId: org._id },
    })
    // Per-tenant lookup index (AuditLog already ships a compound index).
    if (Model !== AuditLog) {
      await Model.collection.createIndex({ organisationId: 1 })
    }
    console.log(
      `${Model.collection.name}: ${modifiedCount} doc(s) assigned to ${org.name}`,
    )
  }

  console.log('Backfill complete.')
  await mongoose.disconnect()
  process.exit(0)
}

migrate().catch(async (err) => {
  console.error('Migration failed:', err)
  await mongoose.disconnect()
  process.exit(1)
})