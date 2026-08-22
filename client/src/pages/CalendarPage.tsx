import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, ArrowLeft, Clock } from 'lucide-react'
import { useTrip } from '../hooks/useTrips'
import { formatCurrency, formatTime, getGradient } from '../lib/formatters'
import type { Stop } from '@globetrotter/shared'
import { clsx } from 'clsx'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TYPE_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-500/15 text-blue-400',
  food: 'bg-orange-500/15 text-orange-400',
  adventure: 'bg-red-500/15 text-red-400',
  culture: 'bg-violet-500/15 text-violet-400',
  relaxation: 'bg-teal-500/15 text-teal-400',
}

export default function CalendarPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Derive initial year/month from the ISO date string directly (no new Date() = no timezone shift)
  const todayStr = new Date().toISOString().slice(0, 10)
  const tripStartStr = trip?.startDate.slice(0, 10) ?? todayStr
  const [year, setYear] = useState(() => parseInt(tripStartStr.slice(0, 4), 10))
  const [month, setMonth] = useState(() => parseInt(tripStartStr.slice(5, 7), 10) - 1)


  if (isLoading) return <div className="max-w-3xl mx-auto skeleton h-96 rounded-2xl" />
  if (!trip) return <div className="text-center py-20 text-slate-400">Trip not found</div>

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Build day metadata
  // Use pure string comparison on YYYY-MM-DD — immune to timezone shifts.
  // All dates stored as UTC midnight, so .slice(0,10) always gives the correct calendar date.
  const dayMeta: Record<number, { stops: Stop[]; activities: Stop['activities'] }> = {}

  trip.stops.forEach((stop) => {
    const startStr = stop.startDate.slice(0, 10)
    const endStr = stop.endDate.slice(0, 10)

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      if (dateStr >= startStr && dateStr <= endStr) {
        if (!dayMeta[d]) dayMeta[d] = { stops: [], activities: [] }
        dayMeta[d].stops.push(stop)

        stop.activities.forEach((sa) => {
          if (sa.scheduledTime) {
            // Has a scheduled time - only show on that specific day
            if (sa.scheduledTime.slice(0, 10) === dateStr) {
              dayMeta[d].activities.push(sa)
            }
          } else {
            // No scheduled time - show on every day of this stop
            // (avoids duplicates: only add if not already present)
            if (!dayMeta[d].activities.find((a) => a.id === sa.id)) {
              dayMeta[d].activities.push(sa)
            }
          }
        })
      }
    }
  })

  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : null
  const selectedMeta = selectedDay ? dayMeta[selectedDay] : null

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
      <div className="flex items-center gap-5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/40" />Trip range
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />Activities (scheduled or unscheduled)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 opacity-40" />No activities
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
            const hasActivities = (meta?.activities.length ?? 0) > 0

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
                {hasActivities && (
                  <div className="flex gap-0.5 mt-0.5">
                    {meta!.activities.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    ))}
                    {meta!.activities.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                    )}
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
          {/* Date + city chips */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-base font-semibold text-white">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {selectedMeta.stops.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs">
                    <MapPin className="w-2.5 h-2.5" /> {s.city.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500 flex-shrink-0">
              {selectedMeta.activities.length} {selectedMeta.activities.length === 1 ? 'activity' : 'activities'}
            </div>
          </div>

          {/* Activities list */}
          {selectedMeta.activities.length > 0 ? (
            <div className="space-y-2">
              {selectedMeta.activities.map((sa) => (
                <div key={sa.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  {/* Type badge */}
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0',
                    TYPE_COLORS[sa.activity.type] ?? 'bg-slate-500/15 text-slate-400'
                  )}>
                    {sa.activity.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{sa.activity.name}</div>
                    {sa.activity.description && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">{sa.activity.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {sa.activity.durationMin > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{sa.activity.durationMin}m
                      </span>
                    )}
                    <span className="text-xs text-amber-400 font-semibold">
                      {formatCurrency(sa.activity.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No activities for this day - free time! 🌅</p>
          )}
        </div>
      )}
    </div>
  )
}
