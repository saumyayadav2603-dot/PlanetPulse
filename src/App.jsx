import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bus,
  CalendarRange,
  Car,
  CheckCircle2,
  CircleAlert,
  Leaf,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  Utensils,
  Zap,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { EMISSION_FACTORS, CATEGORY_COLORS } from './data/emissionFactors.js'
import {
  calculateCO2,
  detectUnusualInput,
  filterActivities,
  formatDate,
  formatKg,
  formatTime,
  getCategoryBreakdown,
  getCurrentWeekRange,
  getDailyTotals,
  getDefaultTarget,
  getPreviousWeekTotal,
  getWeeklyActivities,
  getWeeklyTotal,
  obtainActivityConfig,
  readStorage,
  validateActivity,
  writeStorage,
} from './utils/planetPulse.js'

const STORAGE_KEYS = {
  activities: 'planetpulse-activities',
  target: 'planetpulse-target',
}

const ACTIVITY_ICONS = {
  'car-travel': Car,
  'bus-travel': Bus,
  flight: Plane,
  electricity: Zap,
  'waste-meal': Trash2,
  'non-waste-meal': Utensils,
}

const DEFAULT_FILTERS = {
  activityType: 'All',
  dateFrom: '',
  dateTo: '',
}

function App() {
  const [activities, setActivities] = useState(() => readStorage(STORAGE_KEYS.activities, []))
  const [target, setTarget] = useState(() => readStorage(STORAGE_KEYS.target, getDefaultTarget()))
  const [selectedActivity, setSelectedActivity] = useState(EMISSION_FACTORS[0].id)
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [targetInput, setTargetInput] = useState(String(target))
  const [pendingWarning, setPendingWarning] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const chartSectionRef = useRef(null)

  const selectedActivityConfig = obtainActivityConfig(selectedActivity) || EMISSION_FACTORS[0]
  const weeklyActivities = useMemo(() => getWeeklyActivities(activities), [activities])
  const weeklyTotal = useMemo(() => getWeeklyTotal(activities), [activities])
  const previousWeekTotal = useMemo(() => getPreviousWeekTotal(activities), [activities])
  const currentWeekRange = useMemo(() => getCurrentWeekRange(new Date()), [])
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(activities), [activities])
  const dailyTotals = useMemo(() => getDailyTotals(activities), [activities])
  const targetPercent = target > 0 ? (weeklyTotal / target) * 100 : 0
  const isOverTarget = weeklyTotal > target
  const remaining = target - weeklyTotal
  const biggestCategory = useMemo(() => {
    if (!categoryBreakdown.length) return null
    return categoryBreakdown.reduce((largest, item) => (item.value > largest.value ? item : largest), categoryBreakdown[0])
  }, [categoryBreakdown])
  const visibleActivities = useMemo(() => filterActivities(activities, filters), [activities, filters])
  const previousWeekChange = previousWeekTotal > 0 ? ((weeklyTotal - previousWeekTotal) / previousWeekTotal) * 100 : null
  const lowestDay = useMemo(() => {
    const filtered = dailyTotals.filter((day) => day.value > 0)
    if (!filtered.length) return null
    return filtered.reduce((lowest, day) => (day.value < lowest.value ? day : lowest), filtered[0])
  }, [dailyTotals])

  const pulseInsight = useMemo(() => {
    if (!weeklyActivities.length) {
      return 'Log your first activity to start understanding your footprint.'
    }

    if (!biggestCategory) {
      return 'Your weekly footprint is still developing — log a few more activities to see the trend.'
    }

    return `${biggestCategory.name} is your largest contributor this week, accounting for ${Math.round((biggestCategory.value / weeklyTotal) * 100 || 0)}% of your footprint.`
  }, [weeklyActivities.length, biggestCategory, weeklyTotal])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.activities, activities)
  }, [activities])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.target, target)
  }, [target])

  const handleAddActivity = () => {
    const validation = validateActivity(selectedActivity, quantity)

    if (!validation.valid) {
      setError(validation.message)
      setMessage('')
      return
    }

    const config = obtainActivityConfig(selectedActivity)
    const numericQuantity = Number(quantity)
    const unusual = detectUnusualInput(selectedActivity, numericQuantity)

    if (unusual) {
      setPendingWarning({
        activityType: config.name,
        quantity: numericQuantity,
        unit: config.unit,
      })
      setError('')
      setMessage('')
      return
    }

    appendActivity(numericQuantity)
  }

  const appendActivity = (numericQuantity) => {
    const config = obtainActivityConfig(selectedActivity)
    const calculatedCo2 = calculateCO2(numericQuantity, config.emissionFactor)

    const newActivity = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      activityType: selectedActivity,
      category: config.category,
      quantity: numericQuantity,
      unit: config.unit,
      emissionFactor: config.emissionFactor,
      co2: calculatedCo2,
      timestamp: new Date().toISOString(),
    }

    setActivities((prev) => [newActivity, ...prev])
    setQuantity('')
    setError('')
    setMessage('Activity logged successfully.')
    setPendingWarning(null)
  }

  const handleTargetSubmit = (event) => {
    event.preventDefault()
    const parsed = Number(targetInput)

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Weekly target must be a positive number.')
      return
    }

    setTarget(parsed)
    setTargetInput(String(parsed))
    setError('')
    setMessage('Weekly target saved.')
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const targetStatus = targetPercent < 80 ? 'Normal' : targetPercent < 100 ? 'Approaching target' : 'Target exceeded'
  const targetWarningMessage = isOverTarget
    ? `Weekly target exceeded. You've exceeded your weekly target by ${Math.abs(remaining).toFixed(2)} kg CO2e. You can continue logging activities. Review your largest contributing category to understand where most of your footprint came from.`
    : ''

  const scrollToContributors = () => {
    chartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark"><Leaf size={18} /></div>
          <div className="brand-name">PlanetPulse</div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {['Dashboard', 'Log Activity', 'History', 'Weekly Target'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeNav === tab ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveNav(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Good morning</p>
            <h1>Know your footprint. Shape your choices.</h1>
          </div>
          <button type="button" className="primary-button" onClick={() => setActiveNav('Log Activity')}>
            <Plus size={18} />
            Log Activity
          </button>
        </header>

        {activeNav === 'Dashboard' && (
          <>
            <section className="hero-card card">
              <div className="hero-header">
                <div>
                  <p className="eyebrow calm">Good morning</p>
                  <p className="section-label">This week</p>
                  <div className="big-total">{formatKg(weeklyTotal)}</div>
                </div>
                <div className="hero-meta">
                  <div className="week-chip">
                    <CalendarRange size={16} />
                    {formatDate(currentWeekRange.start)} – {formatDate(currentWeekRange.end)}
                  </div>
                  {previousWeekTotal > 0 && previousWeekChange !== null && (
                    <div className={`trend-pill ${previousWeekChange <= 0 ? 'trend-down' : 'trend-up'}`}>
                      {previousWeekChange <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      {Math.abs(previousWeekChange).toFixed(1)}% vs previous week
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid-two">
              <div className="card">
                <div className="section-header-row">
                  <div>
                    <p className="section-label">Weekly target</p>
                    <h2>{weeklyTotal.toFixed(1)} / {target.toFixed(1)} kg CO2e</h2>
                  </div>
                  <span className={`pill status-${targetPercent >= 100 ? 'danger' : targetPercent >= 80 ? 'warning' : 'ok'}`}>
                    {Math.round(targetPercent)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(targetPercent, 100)}%` }} />
                </div>
                <p className="meta-line">
                  {isOverTarget ? `Exceeded by ${Math.abs(remaining).toFixed(2)} kg` : `${remaining.toFixed(2)} kg remaining`}
                </p>
                {isOverTarget && (
                  <div className="alert-box warning-box" role="alert">
                    <CircleAlert size={18} />
                    <div>
                      <strong>Weekly target crossed</strong>
                      <p>{targetWarningMessage}</p>
                      <button type="button" className="inline-action" onClick={scrollToContributors}>View contributors</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card insight-card">
                <div className="section-header-row compact">
                  <p className="section-label">Pulse Insight</p>
                  <Sparkles size={16} className="sparkle" />
                </div>
                {weeklyActivities.length === 0 ? (
                  <div className="empty-inline">Log your first activity to start understanding your footprint.</div>
                ) : (
                  <>
                    <h3>{pulseInsight}</h3>
                    <p className="meta-line">
                      {weeklyActivities.length} activities logged • {targetPercent >= 100 ? `${Math.abs(remaining).toFixed(2)} kg above target` : `${remaining.toFixed(2)} kg remaining before target`}
                    </p>
                  </>
                )}
              </div>
            </section>

            <section className="summary-grid">
              <div className="card summary-card">
                <p className="section-label">Weekly recap</p>
                <h3>Activities</h3>
                <div className="metric-value">{weeklyActivities.length}</div>
              </div>
              <div className="card summary-card">
                <p className="section-label">Largest category</p>
                <h3>{biggestCategory ? biggestCategory.name : 'No data yet'}</h3>
                <div className="metric-value">{biggestCategory ? `${biggestCategory.value.toFixed(2)} kg` : '—'}</div>
              </div>
              <div className="card summary-card">
                <p className="section-label">Lowest-footprint day</p>
                <h3>{lowestDay ? lowestDay.label : 'No data yet'}</h3>
                <div className="metric-value">{lowestDay ? `${lowestDay.value.toFixed(2)} kg` : '—'}</div>
              </div>
            </section>

            <section className="card seven-day-card">
              <div className="section-header-row">
                <p className="section-label">7-day footprint</p>
              </div>
              <div className="day-grid">
                {dailyTotals.map((day) => (
                  <div key={day.key} className="day-column">
                    <div className="day-bar-wrap">
                      <div className="day-bar" style={{ height: `${Math.max((day.value / Math.max(weeklyTotal || 1, 1)) * 100, day.value > 0 ? 12 : 6)}%` }} />
                    </div>
                    <div className="day-label">{day.label}</div>
                    <div className="day-value">{day.value.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section ref={chartSectionRef} className="chart-card card">
              <div className="section-header-row">
                <p className="section-label">Category breakdown</p>
              </div>

              {categoryBreakdown.length === 0 ? (
                <div className="empty-box">
                  <BarChart3 size={32} />
                  <p>No chart data yet.</p>
                  <small>Log a few activities to see where your footprint is coming from.</small>
                </div>
              ) : (
                <div className="chart-layout">
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                          {categoryBreakdown.map((entry) => (
                            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} kg CO2e`, 'CO2']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="legend-list">
                    {categoryBreakdown.map((entry) => (
                      <div className="legend-item" key={entry.name}>
                        <span className="legend-dot" style={{ background: CATEGORY_COLORS[entry.name] }} />
                        <span>{entry.name}</span>
                        <strong>{entry.value.toFixed(2)} kg</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="card">
              <div className="section-header-row">
                <p className="section-label">Recent activities</p>
                <button type="button" className="link-button" onClick={() => setActiveNav('History')}>View History</button>
              </div>
              {activities.length === 0 ? (
                <div className="empty-list">No activities yet. Start by logging an everyday activity to see your carbon footprint.</div>
              ) : (
                <div className="activity-list compact-list">
                  {activities.slice(0, 5).map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.activityType] || Activity
                    return (
                      <div className="activity-row" key={activity.id}>
                        <div className="activity-main">
                          <div className="activity-icon"><Icon size={18} /></div>
                          <div>
                            <strong>{obtainActivityConfig(activity.activityType)?.name || 'Activity'}</strong>
                            <span>{activity.quantity} {activity.unit}</span>
                          </div>
                        </div>
                        <span>{formatKg(activity.co2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeNav === 'Log Activity' && (
          <section className="card single-column">
            <div className="section-header-row">
              <div>
                <p className="section-label">Log an activity</p>
                <h2>Add to your footprint</h2>
              </div>
            </div>

            <div className="activity-grid">
              {EMISSION_FACTORS.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.id] || Activity
                const isSelected = selectedActivity === activity.id
                return (
                  <button
                    key={activity.id}
                    type="button"
                    className={isSelected ? 'activity-select selected' : 'activity-select'}
                    onClick={() => setSelectedActivity(activity.id)}
                  >
                    <Icon size={18} />
                    {activity.name}
                  </button>
                )
              })}
            </div>

            <div className="field-group">
              <label htmlFor="quantity">Quantity</label>
              <div className="quantity-input-wrap">
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder={`Enter ${selectedActivityConfig.unit}`}
                />
                <span>{selectedActivityConfig.unit}</span>
              </div>
            </div>

            <div className="calc-preview">
              <div className="preview-row">
                <span>{quantity || '0'} {selectedActivityConfig.unit}</span>
                <span>× {selectedActivityConfig.emissionFactor} kg CO2/{selectedActivityConfig.unit}</span>
              </div>
              <div className="preview-row preview-total">
                <span>Estimated footprint</span>
                <strong>{formatKg(calculateCO2(quantity || 0, selectedActivityConfig.emissionFactor))}</strong>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button" onClick={handleAddActivity}>Add Activity</button>
            </div>

            {pendingWarning && (
              <div className="alert-box warning-box" role="alert">
                <CircleAlert size={18} />
                <div>
                  <strong>That looks unusually high.</strong>
                  <p>You entered {pendingWarning.quantity} {pendingWarning.unit} for {pendingWarning.activityType}. Please check the quantity and unit.</p>
                </div>
              </div>
            )}

            {pendingWarning && (
              <div className="warning-actions">
                <button type="button" className="secondary-button" onClick={() => setPendingWarning(null)}>
                  Edit Entry
                </button>
                <button type="button" className="primary-button" onClick={() => appendActivity(pendingWarning.quantity)}>
                  Log Anyway
                </button>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box"><CheckCircle2 size={18} /> {message}</div>}
          </section>
        )}

        {activeNav === 'History' && (
          <section className="card history-card">
            <div className="section-header-row">
              <div>
                <p className="section-label">History</p>
                <h2>Activity log</h2>
              </div>
              <button type="button" className="link-button" onClick={clearFilters}>Reset filters</button>
            </div>

            <div className="filters-grid">
              <div className="field-group">
                <label htmlFor="activityFilter">Activity type</label>
                <select
                  id="activityFilter"
                  value={filters.activityType}
                  onChange={(event) => setFilters((prev) => ({ ...prev, activityType: event.target.value }))}
                >
                  <option value="All">All</option>
                  {EMISSION_FACTORS.map((activity) => (
                    <option key={activity.id} value={activity.id}>{activity.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="fromDate">From date</label>
                <input
                  id="fromDate"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                />
              </div>

              <div className="field-group">
                <label htmlFor="toDate">To date</label>
                <input
                  id="toDate"
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                />
              </div>
            </div>

            {visibleActivities.length === 0 ? (
              <div className="empty-box">
                <Activity size={32} />
                <p>No activities match these filters.</p>
              </div>
            ) : (
              <div className="history-table">
                <div className="history-header history-row">
                  <span>Activity</span>
                  <span>Category</span>
                  <span>Quantity</span>
                  <span>CO2</span>
                  <span>Date</span>
                  <span>Time</span>
                </div>
                {visibleActivities.map((activity) => {
                  const config = obtainActivityConfig(activity.activityType)
                  return (
                    <div className="history-row" key={activity.id}>
                      <span>{config?.name || 'Activity'}</span>
                      <span>{config?.category || activity.category}</span>
                      <span>{activity.quantity} {activity.unit}</span>
                      <span>{formatKg(activity.co2)}</span>
                      <span>{formatDate(activity.timestamp)}</span>
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeNav === 'Weekly Target' && (
          <section className="card target-card">
            <div className="section-header-row">
              <div>
                <p className="section-label">Weekly target</p>
                <h2>Set your carbon allowance</h2>
              </div>
            </div>

            <form onSubmit={handleTargetSubmit} className="target-form">
              <label htmlFor="targetInput">Weekly Target</label>
              <div className="target-input-row">
                <div className="quantity-input-wrap">
                  <input
                    id="targetInput"
                    type="number"
                    min="1"
                    step="0.1"
                    value={targetInput}
                    onChange={(event) => setTargetInput(event.target.value)}
                  />
                  <span>kg CO2e</span>
                </div>
                <button type="button" className="primary-button" onClick={() => { const parsed = Number(targetInput); if (Number.isFinite(parsed) && parsed > 0) { setTarget(parsed); setMessage('Weekly target saved.'); setError(''); } else { setError('Weekly target must be a positive number.'); } }}>Save Target</button>
              </div>
            </form>

            <div className="progress-box">
              <div className="section-header-row">
                <span>{weeklyTotal.toFixed(1)} / {target.toFixed(1)} kg CO2e</span>
                <span>{Math.min(Math.round(targetPercent), 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(targetPercent, 100)}%` }} />
              </div>
              <div className={`status-badge status-${targetPercent >= 100 ? 'danger' : targetPercent >= 80 ? 'warning' : 'ok'}`}>
                {targetStatus}
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box"><CheckCircle2 size={18} /> {message}</div>}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
