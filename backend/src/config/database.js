import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let memoryServer = null

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { dbName: 'planetpulse' })
      console.log(`MongoDB connected: ${mongoUri}`)
      return true
    } catch (error) {
      console.error('MongoDB connection failed:', error.message)
      return false
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is required in production mode.')
  }

  try {
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'planetpulse' } })
    await mongoose.connect(memoryServer.getUri(), { dbName: 'planetpulse' })
    console.log(`MongoDB connected using in-memory server: ${memoryServer.getUri()}`)
    return true
  } catch (error) {
    console.error('In-memory MongoDB connection failed:', error.message)
    return false
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect()

  if (memoryServer) {
    await memoryServer.stop()
    memoryServer = null
  }
}
