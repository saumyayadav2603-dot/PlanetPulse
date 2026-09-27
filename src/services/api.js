const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || 'Request failed.'
    throw new Error(message)
  }

  return payload
}

export async function createActivity(activityData) {
  const payload = await request('/activities', {
    method: 'POST',
    body: JSON.stringify(activityData),
  })

  return payload.activity
}

export async function getActivities(filters = {}) {
  const params = new URLSearchParams()

  if (filters.category) params.set('category', filters.category)
  if (filters.activityType) params.set('activityType', filters.activityType)

  const query = params.toString() ? `?${params.toString()}` : ''
  const payload = await request(`/activities${query}`)
  return payload.activities || []
}

export async function deleteActivity(id) {
  const payload = await request(`/activities/${id}`, {
    method: 'DELETE',
  })

  return payload
}

export async function getWeeklyDashboard() {
  const payload = await request('/dashboard/weekly')
  return payload
}

export async function getSettings() {
  const payload = await request('/settings')
  return payload
}

export async function updateSettings(data) {
  const payload = await request('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  return payload
}
