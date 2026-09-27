import express from 'express'
import {
  createActivityService,
  deleteActivityService,
  getActivitiesService,
  getDashboardWeeklyService,
  getSettingsService,
  updateSettingsService,
  validateUnusualOverride,
} from '../services/activityService.js'

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'PlanetPulse API is running' })
})

router.post('/activities', async (req, res, next) => {
  try {
    const payload = req.body || {}
    const activityType = payload.activityType
    const quantity = payload.quantity

    if (typeof activityType !== 'string' || !activityType.trim()) {
      return res.status(400).json({ success: false, message: 'Activity type is required.' })
    }

    if (typeof quantity === 'undefined' || quantity === null || quantity === '') {
      return res.status(400).json({ success: false, message: 'Quantity is required.' })
    }

    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a valid number greater than zero.' })
    }

    const overrideAllowed = validateUnusualOverride(activityType, quantity)
    if (overrideAllowed) {
      console.log(`Unusual input override allowed for ${activityType}: ${quantity}`)
    }

    const activity = await createActivityService({ activityType, quantity })
    res.status(201).json({ success: true, activity })
  } catch (error) {
    next(error)
  }
})

router.get('/activities', async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      activityType: req.query.activityType,
    }

    const activities = await getActivitiesService(filters)
    res.json({ success: true, activities })
  } catch (error) {
    next(error)
  }
})

router.delete('/activities/:id', async (req, res, next) => {
  try {
    await deleteActivityService(req.params.id)
    res.json({ success: true, message: 'Activity deleted successfully.' })
  } catch (error) {
    next(error)
  }
})

router.get('/dashboard/weekly', async (req, res, next) => {
  try {
    const dashboard = await getDashboardWeeklyService()
    res.json(dashboard)
  } catch (error) {
    next(error)
  }
})

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await getSettingsService()
    res.json({ success: true, ...settings })
  } catch (error) {
    next(error)
  }
})

router.put('/settings', async (req, res, next) => {
  try {
    const settings = await updateSettingsService(req.body || {})
    res.json({ success: true, ...settings })
  } catch (error) {
    next(error)
  }
})

export default router
