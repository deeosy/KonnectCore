import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'

// Workaround for broken system DNS: force Node's resolver to use a public
// DNS server (Google) so Atlas hostnames can be resolved reliably.
dns.setServers(['8.8.8.8', '8.8.4.4'])

dotenv.config()

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}
