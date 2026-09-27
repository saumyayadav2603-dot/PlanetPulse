export const EMISSION_FACTORS = [
  {
    id: 'car-travel',
    name: 'Car Travel',
    category: 'Transport',
    unit: 'km',
    emissionFactor: 0.2,
    icon: 'Car',
  },
  {
    id: 'bus-travel',
    name: 'Bus Travel',
    category: 'Transport',
    unit: 'km',
    emissionFactor: 0.1,
    icon: 'Bus',
  },
  {
    id: 'flight',
    name: 'Flight',
    category: 'Transport',
    unit: 'km',
    emissionFactor: 0.18,
    icon: 'Plane',
  },
  {
    id: 'electricity',
    name: 'Electricity',
    category: 'Electricity',
    unit: 'kWh',
    emissionFactor: 0.42,
    icon: 'Zap',
  },
  {
    id: 'waste-meal',
    name: 'Waste Meal',
    category: 'Waste',
    unit: 'meals',
    emissionFactor: 0.9,
    icon: 'Trash',
  },
  {
    id: 'non-waste-meal',
    name: 'Non-Waste Meal',
    category: 'Food',
    unit: 'meals',
    emissionFactor: 0.42,
    icon: 'Utensils',
  },
]

export const ACTIVITY_LOOKUP = Object.fromEntries(
  EMISSION_FACTORS.map((item) => [item.id, item]),
)

export const CATEGORY_COLORS = {
  Transport: '#3b82f6',
  Electricity: '#8b5cf6',
  Food: '#f59e0b',
  Waste: '#ef4444',
}

export const CATEGORY_ORDER = ['Transport', 'Electricity', 'Food', 'Waste']

export const DEFAULT_WEEKLY_TARGET = 40

export const USUAL_INPUT_THRESHOLDS = {
  'car-travel': 5000,
  'bus-travel': 5000,
  flight: 5000,
  electricity: 500,
  'waste-meal': 200,
  'non-waste-meal': 200,
}
