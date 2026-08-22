/** Format a number as Indian Rupees - ₹1,23,456 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a date string as "22 Aug, 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-IN', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month}, ${year}`
}


/** Format a date range as "22 Aug, 2026 - 30 Aug, 2026" */
export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`
}


/** Number of days between two ISO date strings */
export function daysBetween(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
}

/** Trip status based on today's date */
export function getTripStatus(start: string, end: string): 'ongoing' | 'upcoming' | 'completed' {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now < s) return 'upcoming'
  if (now > e) return 'completed'
  return 'ongoing'
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
