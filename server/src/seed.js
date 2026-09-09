import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Organisation from './models/Organisation.js'
import Crop from './models/Crop.js'
import { connectDB } from './utils/db.js'

dotenv.config()

const DEFAULT_CROPS = [
  { name: 'Cocoa', category: 'cash crop' },
  { name: 'Coffee', category: 'cash crop' },
  { name: 'Maize', category: 'cereal' },
  { name: 'Cassava', category: 'root/tuber' },
  { name: 'Rice', category: 'cereal' },
  { name: 'Plantain', category: 'fruit' },
  { name: 'Yam', category: 'root/tuber' },
  { name: 'Groundnut', category: 'legume' },
  { name: 'Soybean', category: 'legume' },
  { name: 'Oil Palm', category: 'tree crop' },
  { name: 'Cashew', category: 'tree crop' },
  { name: 'Vegetables', category: 'vegetable' },
  { name: 'Other', category: 'other' },
]

async function seed() {
  try {
    // connectDB applies the same DNS/URI normalization as the app server
    // (including appending the DB_NAME segment when the URI omits it), so the
    // seed always targets the database the API actually reads from.
    await connectDB()
    console.log('Connected to MongoDB')

    await seedCrops()

    const adminEmail = 'admin@konnectcore.com'
    const existing = await User.findOne({ email: adminEmail })
    if (existing) {
      console.log('Admin user already exists')
    } else {
      const admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        phone: '0000000000',
      })
      console.log(`Created admin user: ${admin.email}`)

      const org = await Organisation.create({
        name: 'Sample Cooperative',
        code: 'KC-COOP',
        location: 'Accra',
        region: 'Greater Accra',
        settings: {
          currency: 'GHS',
          qualityGrades: ['A', 'B', 'C', 'Premium', 'Standard', 'Reject'],
        },
      })
      await User.findByIdAndUpdate(admin._id, { organisationId: org._id })
      console.log(`Created organisation: ${org.name}`)
    }

    console.log('Seed complete. Login with admin@konnectcore.com / admin123')
  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

// Seed the crop reference catalog with a unique merge: existing crops are
// kept as-is, missing defaults are inserted. Safe to re-run.
async function seedCrops() {
  const names = await Crop.find().select('name')
  const existingNames = new Set(names.map((c) => c.name))
  const missing = DEFAULT_CROPS.filter((c) => !existingNames.has(c.name))
  if (missing.length === 0) {
    console.log(`Crop catalog up to date (${existingNames.size} crops)`)
    return
  }
  await Crop.insertMany(missing)
  console.log(`Seeded ${missing.length} crops`)
}

seed()