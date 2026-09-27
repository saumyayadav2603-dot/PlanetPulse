import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'planetpulse',
      unique: true,
    },
    weeklyTarget: {
      type: Number,
      default: 40,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Settings', settingsSchema)
