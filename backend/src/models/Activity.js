import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.0001, 'Quantity must be greater than zero.'],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    emissionFactor: {
      type: Number,
      required: true,
      min: 0,
    },
    co2: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Activity', activitySchema)
