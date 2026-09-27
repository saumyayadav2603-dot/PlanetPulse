export const EMISSION_FACTORS = [
  {
    id: 'car-travel',
    name: 'Car Travel',
    category: 'Transport',
    unit: 'km',
    emissionFactor: 0.2,
  },
  {
    id: 'bus-travel',
    name: 'Bus Travel',
    category: 'Transport',
    unit: 'km',
    emissionFactor: 0.1,
  },
  {
    id: 'flight',
    name: 'Flight',
    category: 'Transport',
    unit: 'km',
    emissionFactor: 0.18,
  },
  {
    id: 'electricity',
    name: 'Electricity',
    category: 'Electricity',
    unit: 'kWh',
    emissionFactor: 0.42,
  },
  {
    id: 'waste-meal',
    name: 'Waste Meal',
    category: 'Waste',
    unit: 'meals',
    emissionFactor: 0.9,
  },
  {
    id: 'non-waste-meal',
    name: 'Non-Waste Meal',
    category: 'Food',
    unit: 'meals',
    emissionFactor: 0.42,
  },
]

export const ACTIVITY_LOOKUP = Object.fromEntries(
  EMISSION_FACTORS.map((item) => [item.id, item]),
)

export const DEFAULT_WEEKLY_TARGET = 40

export const CATEGORY_ORDER = ['Transport', 'Electricity', 'Food', 'Waste']

export const USUAL_INPUT_THRESHOLDS = {
  'car-travel': 5000,
  'bus-travel': 5000,
  flight: 5000,
  electricity: 500,
  'waste-meal': 200,
  'non-waste-meal': 200,
}
