/**
 * Format a number as Indian currency (₹)
 * Examples: 500 → ₹500, 1000 → ₹1,000, 100000 → ₹1,00,000
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '₹0'
  const num = Number(amount)
  if (isNaN(num)) return '₹0'
  return '₹' + num.toLocaleString('en-IN')
}

/**
 * Format a date string as readable date
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Gift type options
 */
export const GIFT_TYPES = [
  'Cash',
  'UPI',
  'Bank Transfer',
  'Cheque',
  'Physical Gift',
  'Gold',
  'Other',
]

/**
 * Event type options
 */
export const EVENT_TYPES = [
  'Wedding',
  'Birthday',
  'Housewarming',
  'Engagement',
  'Anniversary',
  'Baby Shower',
  'Naming Ceremony',
  'Festival',
  'Other',
]

/**
 * Badge color for gift type
 */
export function giftTypeBadgeColor(type) {
  const map = {
    Cash: 'bg-green-100 text-green-800',
    UPI: 'bg-blue-100 text-blue-800',
    'Bank Transfer': 'bg-indigo-100 text-indigo-800',
    Cheque: 'bg-yellow-100 text-yellow-800',
    'Physical Gift': 'bg-pink-100 text-pink-800',
    Gold: 'bg-amber-100 text-amber-800',
    Other: 'bg-gray-100 text-gray-800',
  }
  return map[type] || 'bg-gray-100 text-gray-800'
}
