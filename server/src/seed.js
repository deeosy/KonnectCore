import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Organisation from './models/Organisation.js'

dotenv.config()

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

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

seed()