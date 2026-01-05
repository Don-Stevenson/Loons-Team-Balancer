import mongoose from 'mongoose'

const uri = process.env.ATLAS_URI

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000, // Keep trying to send operations for 8 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }

    cached.promise = mongoose.connect(uri, opts).then(mongoose => {
      console.log('Connected to MongoDB successfully!')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('Failed to connect to MongoDB:', e)
    throw e
  }

  return cached.conn
}

export default connectDB
