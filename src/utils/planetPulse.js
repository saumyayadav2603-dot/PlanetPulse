import {
  ACTIVITY_LOOKUP,
  CATEGORY_ORDER,
  DEFAULT_WEEKLY_TARGET,
  USUAL_INPUT_THRESHOLDS,
} from '../data/emissionFactors.js'

export function calculateCO2(quantity, emissionFactor) {
  const numericValue = Number(quantity)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Number((numericValue * emissionFactor).toFixed(2))
}

export function obtainActivityConfig(activityType) {
  return ACTIVITY_LOOKUP[activityType] ?? null
}

export function validateActivity(activityType, quantity) {
  if (!activityType) {
    return { valid: false, message: 'Please choose an activity type.' }
  }

  const numericValue = Number(quantity)

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

  if (!threshold) {
    return false
  }

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

export function getWeeklyActivities(activities, date = new Date()) {
  const { start, end } = getCurrentWeekRange(date)

  return activities.filter((activity) => {
    const timestamp = new Date(activity.timestamp)
    return timestamp >= start && timestamp <= end
  })
}

export function getPreviousWeekActivities(activities, date = new Date()) {
  const { start, end } = getPreviousWeekRange(date)

  return activities.filter((activity) => {
    const timestamp = new Date(activity.timestamp)
    return timestamp >= start && timestamp <= end
  })
}

export function getWeeklyTotal(activities, date = new Date()) {
  return getWeeklyActivities(activities, date).reduce(
    (sum, activity) => sum + Number(activity.co2 || 0),
    0,
  )
}

export function getPreviousWeekTotal(activities, date = new Date()) {
  return getPreviousWeekActivities(activities, date).reduce(
    (sum, activity) => sum + Number(activity.co2 || 0),
    0,
  )
}

export function getDailyTotals(activities, date = new Date()) {
  const { start } = getCurrentWeekRange(date)
  const totals = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)

    return {
      key: day.toISOString(),
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      date: day,
      value: 0,
    }
  })

  for (const activity of getWeeklyActivities(activities, date)) {
    const activityDate = new Date(activity.timestamp)
    const dayIndex = (activityDate.getDay() + 6) % 7
    totals[dayIndex].value = Number((totals[dayIndex].value + Number(activity.co2 || 0)).toFixed(2))
  }

  return totals
}

export function getCategoryBreakdown(activities, date = new Date()) {
  const totals = {
    Transport: 0,
    Electricity: 0,
    Food: 0,
    Waste: 0,
  }

  const weeklyItems = getWeeklyActivities(activities, date)

  for (const item of weeklyItems) {
    const config = obtainActivityConfig(item.activityType)
    if (!config) continue
    totals[config.category] = Number((totals[config.category] + Number(item.co2 || 0)).toFixed(2))
  }

  return CATEGORY_ORDER.map((category) => ({
    name: category,
    value: totals[category],
  })).filter((entry) => entry.value > 0)
}

export function filterActivities(activities, filters = {}) {
  const activityType = filters.activityType || 'All'
  const dateFrom = filters.dateFrom || ''
  const dateTo = filters.dateTo || ''

  return [...activities]
    .filter((activity) => {
      if (activityType !== 'All' && activity.activityType !== activityType) {
        return false
      }

      const timestamp = new Date(activity.timestamp)

      if (dateFrom) {
        const fromDate = new Date(`${dateFrom}T00:00:00`)
        if (timestamp < fromDate) return false
      }

      if (dateTo) {
        const toDate = new Date(`${dateTo}T23:59:59`)
        if (timestamp > toDate) return false
      }

      return true
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}

export function formatTime(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

export function formatKg(value) {
  return `${Number(value).toFixed(2)} kg CO2e`
}

export function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key)

    if (!savedValue) {
      return fallbackValue
    }

    const parsedValue = JSON.parse(savedValue)
    return parsedValue ?? fallbackValue
  } catch {
    return fallbackValue
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function getDefaultTarget() {
  return DEFAULT_WEEKLY_TARGET
}
