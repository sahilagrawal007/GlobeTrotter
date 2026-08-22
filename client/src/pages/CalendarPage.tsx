import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, ArrowLeft } from 'lucide-react'
import { useTrip } from '../hooks/useTrips'
import { formatCurrency, getGradient } from '../lib/formatters'
import type { Stop } from '@globetrotter/shared'
import { clsx } from 'clsx'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isBetween(date: Date, start: Date, end: Date) {
  return date >= start && date <= end
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = new Date()
  const tripStart = trip ? new Date(trip.startDate) : today
  const [year, setYear] = useState(tripStart.getFullYear())
  const [month, setMonth] = useState(tripStart.getMonth())

  if (isLoading) return <div className="max-w-3xl mx-auto skeleton h-96 rounded-2xl" />
  if (!trip) return <div className="text-center py-20 text-slate-400">Trip not found</div>

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Build day metadata
  const dayMeta: Record<number, { stops: Stop[]; activities: Stop['activities'] }> = {}
  trip.stops.forEach((stop) => {
    const start = new Date(stop.startDate)
    const end = new Date(stop.endDate)
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d)
      if (isBetween(dt, start, end)) {
        if (!dayMeta[d]) dayMeta[d] = { stops: [], activities: [] }
        dayMeta[d].stops.push(stop)
        const dateStr = dt.toISOString().slice(0, 10)
        const dayActivities = stop.activities.filter((sa) =>
          sa.scheduledTime ? sa.scheduledTime.slice(0, 10) === dateStr : false
        )
        dayMeta[d].activities.push(...dayActivities)
      }
    }
  })

  const selectedMeta = selectedDate
    ? dayMeta[parseInt(selectedDate.split('-')[2])]
    : null

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/trips/${tripId}`} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar View</h1>
          <p className="text-slate-400 text-sm mt-0.5">{trip.name}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/40" />Trip range
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />Activities scheduled
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-white/8">
          {DAY_NAMES.map((d) => (
            <div key={d} className="p-3 text-center text-xs font-medium text-slate-500">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="h-16 border-b border-r border-white/5" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const meta = dayMeta[day]
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = new Date().toISOString().slice(0, 10) === dateStr
            const isSelected = selectedDate === dateStr
            const isTrip = !!meta
            const grad = meta?.stops[0] ? getGradient(meta.stops[0].city.name) : ''

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={clsx(
                  'h-16 border-b border-r border-white/5 p-1.5 cursor-pointer transition-all',
                  isTrip ? 'bg-teal-500/8 hover:bg-teal-500/15' : 'hover:bg-white/3',
                  isSelected && 'bg-teal-500/20 ring-1 ring-teal-500/50 ring-inset',
                )}
              >
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium mb-0.5',
                  isToday ? 'bg-teal-500 text-white' : isTrip ? 'text-white' : 'text-slate-500'
                )}>
                  {day}
                </div>
                {meta?.stops[0] && (
                  <div className="text-xs text-teal-400 truncate leading-tight">
                    {meta.stops[0].city.name}
                  </div>
                )}
                {meta?.activities.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {meta.activities.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && selectedMeta && (
        <div className="glass-card p-5 animate-slide-up">
          <div className="text-sm font-semibold text-white mb-3">
            {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="flex items-center gap-2 mb-3">
            {selectedMeta.stops.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs">
                <MapPin className="w-2.5 h-2.5" /> {s.city.name}
              </div>
            ))}
          </div>
          {selectedMeta.activities.length > 0 ? (
            <div className="space-y-2">
              {selectedMeta.activities.map((sa) => (
                <div key={sa.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <div className="text-sm text-white">{sa.activity.name}</div>
                  <div className="text-xs text-amber-400 font-medium">{formatCurrency(sa.activity.cost)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No activities scheduled - enjoy the day!</p>
          )}
        </div>
      )}
    </div>
  )
}
