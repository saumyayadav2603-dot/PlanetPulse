import Settings from '../models/Settings.js'
import { ACTIVITY_LOOKUP, CATEGORY_ORDER, DEFAULT_WEEKLY_TARGET, USUAL_INPUT_THRESHOLDS } from '../config/constants.js'

export async function getStoredSettings() {
  const settings = await Settings.findOne({ name: 'planetpulse' })

  if (settings) {
    return settings
  }

  return Settings.create({
    name: 'planetpulse',
    weeklyTarget: DEFAULT_WEEKLY_TARGET,
  })
}

export function toNumber(value) {
  return Number(value)
}

export function calculateCO2(quantity, emissionFactor) {
  const numericValue = toNumber(quantity)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Number((numericValue * emissionFactor).toFixed(2))
}

export function getActivityConfig(activityType) {
  if (!activityType || typeof activityType !== 'string') {
    return null
  }

  const normalizedInput = activityType.trim()
  const directLookup = ACTIVITY_LOOKUP[normalizedInput]
  if (directLookup) {
    return directLookup
  }

  const nameLookup = Object.values(ACTIVITY_LOOKUP).find(
    (entry) => entry.name.toLowerCase() === normalizedInput.toLowerCase(),
  )

  return nameLookup || null
}

export function validateActivityInput(activityType, quantity) {
  if (!activityType) {
    return { valid: false, message: 'Please choose an activity type.' }
  }

  const numericValue = toNumber(quantity)

  if (quantity === '' || quantity === null || typeof quantity === 'undefined') {
    return { valid: false, message: 'Please enter a quantity.' }
  }

  if (!Number.isFinite(numericValue) || Number.isNaN(numericValue)) {
    return { valid: false, message: 'Quantity must be a valid number.' }
  }

  if (numericValue <= 0) {
    return { valid: false, message: 'Quantity must be greater than zero.' }
  }

  return { valid: true, value: numericValue }
}

export function detectUnusualInput(activityType, quantity) {
  const threshold = USUAL_INPUT_THRESHOLDS[activityType]
  if (!threshold) return false
  return Number(quantity) > threshold
}

export function getCurrentWeekRange(date = new Date()) {
  const currentDate = new Date(date)
  const dayIndex = currentDate.getDay()
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex

  const start = new Date(currentDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(currentDate.getDate() + mondayOffset)

  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  end.setDate(start.getDate() + 6)

  return { start, end }
}

export function getPreviousWeekRange(date = new Date()) {
  const currentWeek = getCurrentWeekRange(date)
  const previousStart = new Date(currentWeek.start)
  previousStart.setDate(currentWeek.start.getDate() - 7)

  const previousEnd = new Date(currentWeek.end)
  previousEnd.setDate(currentWeek.end.getDate() - 7)

  return { start: previousStart, end: previousEnd }
}

export function getDefaultTarget() {
  return DEFAULT_WEEKLY_TARGET
}

export function buildCategoryBreakdown(entries) {
  const totals = {
    Transport: 0,
    Electricity: 0,
    Food: 0,
    Waste: 0,
  }

  for (const entry of entries) {
    const category = entry.category
    if (!category || !totals[category]) continue
    totals[category] = Number((totals[category] + Number(entry.co2 || 0)).toFixed(2))
  }

  return CATEGORY_ORDER.map((category) => ({
    category,
    total: totals[category],
  })).filter((entry) => entry.total > 0)
}

export function buildDailyBreakdown(entries) {
  const { start } = getCurrentWeekRange(new Date())
  const totals = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)

    return {
      date: day.toISOString(),
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      co2: 0,
      activityCount: 0,
    }
  })

  for (const entry of entries) {
    const activityDate = new Date(entry.timestamp)
    const dayIndex = (activityDate.getDay() + 6) % 7
    totals[dayIndex].co2 = Number((totals[dayIndex].co2 + Number(entry.co2 || 0)).toFixed(2))
    totals[dayIndex].activityCount += 1
  }

  return totals.filter((day) => day.co2 > 0)
}
