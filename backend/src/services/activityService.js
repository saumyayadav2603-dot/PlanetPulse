import Activity from '../models/Activity.js'
import { calculateCO2, getActivityConfig, validateActivityInput, detectUnusualInput, getCurrentWeekRange, getDefaultTarget, getStoredSettings } from '../utils/helpers.js'

export async function createActivityService(payload) {
  const config = getActivityConfig(payload.activityType)

  if (!config) {
    throw Object.assign(new Error('Unsupported activity type.'), { statusCode: 400 })
  }

  const validation = validateActivityInput(config.id, payload.quantity)
  if (!validation.valid) {
    throw Object.assign(new Error(validation.message), { statusCode: 400 })
  }

  const numericQuantity = Number(payload.quantity)
  const co2 = calculateCO2(numericQuantity, config.emissionFactor)

  const activity = await Activity.create({
    activityType: config.id,
    category: config.category,
    quantity: numericQuantity,
    unit: config.unit,
    emissionFactor: config.emissionFactor,
    co2,
    timestamp: new Date(),
  })

  return {
    id: activity._id.toString(),
    activityType: config.name,
    category: activity.category,
    quantity: activity.quantity,
    unit: activity.unit,
    emissionFactor: activity.emissionFactor,
    co2: activity.co2,
    timestamp: activity.timestamp,
  }
}

export async function getActivitiesService(filters = {}) {
  const query = {}

  if (filters.category) {
    query.category = filters.category
  }

  if (filters.activityType) {
    query.activityType = filters.activityType
  }

  const activities = await Activity.find(query).sort({ timestamp: -1 }).lean()

  return activities.map((activity) => ({
    id: activity._id.toString(),
    activityType: activity.activityType,
    category: activity.category,
    quantity: activity.quantity,
    unit: activity.unit,
    emissionFactor: activity.emissionFactor,
    co2: activity.co2,
    timestamp: activity.timestamp,
  }))
}

export async function deleteActivityService(id) {
  const deleted = await Activity.findByIdAndDelete(id)

  if (!deleted) {
    throw Object.assign(new Error('Activity not found.'), { statusCode: 404 })
  }

  return deleted
}

export async function getDashboardWeeklyService() {
  const currentWeek = getCurrentWeekRange(new Date())
  const activities = await Activity.find({
    timestamp: {
      $gte: currentWeek.start,
      $lte: currentWeek.end,
    },
  }).lean()

  const totalCO2 = activities.reduce((sum, item) => sum + Number(item.co2 || 0), 0)
  const settings = await getStoredSettings()
  const weeklyTarget = settings.weeklyTarget ?? getDefaultTarget()
  const remaining = weeklyTarget - totalCO2
  const targetExceeded = totalCO2 > weeklyTarget

  const categoryBreakdown = activities.reduce((acc, item) => {
    const category = item.category
    if (!category) return acc
    acc[category] = Number((acc[category] || 0) + Number(item.co2 || 0)).toFixed(2)
    return acc
  }, {})

  const breakdownArray = Object.entries(categoryBreakdown).map(([category, total]) => ({
    category,
    total: Number(total),
  }))

  const dailyBreakdown = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(currentWeek.start)
    day.setDate(currentWeek.start.getDate() + index)

    return {
      date: day.toISOString(),
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      co2: 0,
      activityCount: 0,
    }
  })

  for (const activity of activities) {
    const date = new Date(activity.timestamp)
    const dayIndex = (date.getDay() + 6) % 7
    dailyBreakdown[dayIndex].co2 = Number((dailyBreakdown[dayIndex].co2 + Number(activity.co2 || 0)).toFixed(2))
    dailyBreakdown[dayIndex].activityCount += 1
  }

  return {
    success: true,
    week: {
      start: currentWeek.start.toISOString(),
      end: currentWeek.end.toISOString(),
    },
    totalCO2: Number(totalCO2.toFixed(2)),
    activityCount: activities.length,
    weeklyTarget,
    remaining: Number(remaining.toFixed(2)),
    targetExceeded,
    categoryBreakdown: Object.fromEntries(
      breakdownArray.map(({ category, total }) => [category, Number(total.toFixed(2))]),
    ),
    dailyBreakdown: dailyBreakdown.filter((day) => day.co2 > 0),
  }
}

export async function getSettingsService() {
  const settings = await getStoredSettings()

  return {
    weeklyTarget: settings.weeklyTarget ?? getDefaultTarget(),
  }
}

export async function updateSettingsService(payload = {}) {
  const nextTarget = Number(payload.weeklyTarget)

  if (!Number.isFinite(nextTarget) || nextTarget < 0) {
    throw Object.assign(new Error('weeklyTarget must be a valid non-negative number.'), { statusCode: 400 })
  }

  const settings = await getStoredSettings()
  settings.weeklyTarget = Number(nextTarget.toFixed(2))
  await settings.save()

  return {
    weeklyTarget: Number(nextTarget.toFixed(2)),
  }
}

export function validateUnusualOverride(activityType, quantity) {
  if (detectUnusualInput(activityType, quantity)) {
    return true
  }

  return false
}
