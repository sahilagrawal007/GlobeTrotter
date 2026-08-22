/** Format a number as Indian Rupees - ₹1,23,456 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

/**
 * Format an ISO date string as "22 Aug, 2026".
 * Parses the YYYY-MM-DD portion directly — never converts through local Date
 * so it is immune to timezone drift (UTC midnight ≠ local date in IST etc.).
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return `${day} ${MONTH_SHORT[month - 1]}, ${year}`
}

/** Format a date range as "22 Aug, 2026 - 30 Aug, 2026" */
export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`
}

/**
 * Format the time from a scheduledTime ISO string as "09:00 AM".
 * Extracts HH:MM directly from the stored UTC string — no local timezone
 * conversion, so user always sees the time they typed (e.g. 09:00 stays 09:00).
 */
export function formatTime(isoTime: string): string {
  const timePart = isoTime.slice(11, 16) // "09:00"
  const [hStr, mStr] = timePart.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${ampm}`
}

/** Number of nights between two ISO date strings (UTC-safe, string-based) */
export function daysBetween(start: string, end: string): number {
  const s = new Date(start.slice(0, 10) + 'T00:00:00Z')
  const e = new Date(end.slice(0, 10) + 'T00:00:00Z')
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000))
}

/** Trip status based on today's date (UTC-safe) */
export function getTripStatus(start: string, end: string): 'ongoing' | 'upcoming' | 'completed' {
  const today = new Date().toISOString().slice(0, 10)
  const s = start.slice(0, 10)
  const e = end.slice(0, 10)
  if (today < s) return 'upcoming'
  if (today > e) return 'completed'
  return 'ongoing'
}

/**
 * Convert a YYYY-MM-DD date string from a <input type="date"> into an ISO
 * string anchored to UTC midnight — so the stored date is always correct
 * regardless of the user's local timezone.
 * e.g. "2026-09-21" → "2026-09-21T00:00:00.000Z"
 */
export function dateToUtcIso(dateStr: string): string {
  return dateStr + 'T00:00:00Z'
}

/** Deterministic gradient from a string (city name / trip name) */
const GRADIENTS = [
  'from-teal-600 to-cyan-800',
  'from-violet-600 to-purple-800',
  'from-amber-600 to-orange-800',
  'from-rose-600 to-pink-800',
  'from-emerald-600 to-teal-800',
  'from-blue-600 to-indigo-800',
  'from-fuchsia-600 to-pink-800',
  'from-sky-600 to-blue-800',
]
export function getGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}
