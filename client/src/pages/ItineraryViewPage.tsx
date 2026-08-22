import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar, MapPin, Clock, BarChart2, Edit3, Share2,
  Copy, Check, ChevronDown, ChevronUp, Globe,
} from 'lucide-react'
import { useTrip, useShareTrip } from '../hooks/useTrips'
import { formatCurrency, formatDate, formatDateRange, formatTime, getGradient, daysBetween } from '../lib/formatters'
import { clsx } from 'clsx'
import type { Stop } from '@globetrotter/shared'

const TYPE_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  food: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  adventure: 'bg-red-500/15 text-red-400 border-red-500/20',
  culture: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  relaxation: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
}

type ViewMode = 'city' | 'day'

function ShareModal({ tripId, isPublic, shareSlug, onClose }: {
  tripId: string; isPublic: boolean; shareSlug: string | null; onClose: () => void
}) {
  const shareTrip = useShareTrip(tripId)
  const [copied, setCopied] = useState(false)
  const shareUrl = shareSlug ? `${window.location.origin}/share/${shareSlug}` : null

  const handleToggle = async () => {
    await shareTrip.mutateAsync(!isPublic)
  }

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-elevated p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
            <Globe className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Share Itinerary</h3>
            <p className="text-slate-400 text-xs">Make your trip public or private</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 mb-4">
          <span className="text-sm text-slate-300">Public visibility</span>
          <button
            onClick={handleToggle}
            disabled={shareTrip.isPending}
            className={clsx(
              'w-11 h-6 rounded-full transition-all duration-300 relative',
              isPublic ? 'bg-teal-500' : 'bg-white/10'
            )}
          >
            <span className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300', isPublic ? 'left-5.5 translate-x-0' : 'left-0.5')} style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(0)' }} />
          </button>
        </div>

        {isPublic && shareSlug && (
          <div className="mb-4">
            <div className="text-xs text-slate-500 mb-1.5">Share link</div>
            <div className="flex gap-2">
              <input readOnly value={shareUrl ?? ''} className="input text-xs py-2 flex-1" />
              <button onClick={handleCopy} className="btn-ghost px-3">
                {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-ghost w-full">Close</button>
      </div>
    </div>
  )
}

function StopCityView({ stop }: { stop: Stop }) {
  const [expanded, setExpanded] = useState(true)
  const grad = getGradient(stop.city.name)
  const nights = daysBetween(stop.startDate, stop.endDate)
  const stopTotal = stop.transportCost + stop.stayCost + stop.mealsCost + stop.activities.reduce((s, sa) => s + (sa.activity?.cost ?? 0), 0)

  return (
    <div className="glass-card overflow-hidden">
      {/* City banner */}
      <div className={`relative h-20 bg-gradient-to-r ${grad} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-between h-full px-5">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-white" />
            <div>
              <div className="text-white font-semibold">{stop.city.name}</div>
              <div className="text-white/70 text-xs">{stop.city.country} · {nights} night{nights !== 1 ? 's' : ''} · {formatDateRange(stop.startDate, stop.endDate)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-white/60">Stop total</div>
              <div className="text-amber-300 font-bold text-sm">{formatCurrency(stopTotal)}</div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4 animate-fade-in">
          {/* Budget breakdown */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Transport', value: stop.transportCost },
              { label: 'Stay', value: stop.stayCost },
              { label: 'Meals', value: stop.mealsCost },
              { label: 'Activities', value: stop.activities.reduce((s, sa) => s + (sa.activity?.cost ?? 0), 0) },
            ].map((item) => (
              <div key={item.label} className="text-center p-2 rounded-xl bg-white/5">
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="text-sm font-semibold text-white">{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>

          {/* Activities timeline */}
          {stop.activities.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Activities</div>
              <div className="space-y-2">
                {stop.activities.map((sa, i) => (
                  <div key={sa.id} className="flex gap-3 items-start">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                      {i < stop.activities.length - 1 && <div className="w-px flex-1 min-h-6 bg-white/10 my-1" />}
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-white/3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white font-medium">{sa.activity.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={clsx('text-xs px-2 py-0.5 rounded-full capitalize border', TYPE_COLORS[sa.activity.type] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20')}>{sa.activity.type}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{sa.activity.durationMin}m</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-amber-400">{formatCurrency(sa.activity.cost)}</div>
                          {sa.scheduledTime && <div className="text-xs text-slate-500">{formatTime(sa.scheduledTime)}</div>}
                        </div>
                      </div>
                      {sa.activity.description && <p className="text-xs text-slate-500 mt-1.5">{sa.activity.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ItineraryViewPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)
  const [viewMode, setViewMode] = useState<ViewMode>('city')
  const [showShare, setShowShare] = useState(false)

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
    </div>
  )
  if (!trip) return <div className="text-center py-20 text-slate-400">Trip not found</div>

  const totalCost = trip.stops.reduce((s, st) =>
    s + st.transportCost + st.stayCost + st.mealsCost + st.activities.reduce((a, sa) => a + (sa.activity?.cost ?? 0), 0), 0)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
          {trip.description && <p className="text-slate-400 text-sm mt-1">{trip.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">{trip.stops.length} stops</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-teal-400 font-semibold">{formatCurrency(totalCost)}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShowShare(true)} className="btn-ghost text-sm">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <Link to={`/trips/${tripId}/builder`} className="btn-ghost text-sm">
            <Edit3 className="w-4 h-4" /> Edit
          </Link>
          <Link to={`/trips/${tripId}/budget`} className="btn-primary text-sm">
            <BarChart2 className="w-4 h-4" /> Budget
          </Link>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
        <button onClick={() => setViewMode('city')} className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'city' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white')}>
          By City
        </button>
        <button onClick={() => setViewMode('day')} className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'day' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white')}>
          By Day
        </button>
        <Link to={`/trips/${tripId}/calendar`} className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-white flex items-center gap-1')}>
          <Calendar className="w-3.5 h-3.5" /> Calendar
        </Link>
      </div>

      {/* Content */}
      {viewMode === 'city' ? (
        <div className="space-y-4">
          {trip.stops.map((stop) => <StopCityView key={stop.id} stop={stop} />)}
        </div>
      ) : (
        <DayView stops={trip.stops} tripStartDate={trip.startDate} />
      )}

      {showShare && (
        <ShareModal
          tripId={tripId!}
          isPublic={trip.isPublic}
          shareSlug={trip.shareSlug}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}


function DayView({ stops, tripStartDate }: { stops: Stop[]; tripStartDate: string }) {
  // All stored dates are UTC midnight, so .slice(0,10) always gives the correct
  // calendar date. String comparison is lexicographically = chronologically correct for ISO dates.
  type DayEntry = { date: string; stop: Stop; activities: Stop['activities'] }
  const days: DayEntry[] = []

  stops.forEach((stop) => {
    const startStr = stop.startDate.slice(0, 10)
    const endStr = stop.endDate.slice(0, 10)

    // Iterate each calendar day in the stop range using UTC-safe arithmetic
    let cur = startStr
    while (cur <= endStr) {
      const dayActivities = stop.activities.filter((sa) => {
        if (sa.scheduledTime) {
          return sa.scheduledTime.slice(0, 10) === cur
        }
        return true  // no date set - show on every day of this stop
      })

      if (!days.find((d) => d.date === cur && d.stop.id === stop.id)) {
        days.push({ date: cur, stop, activities: dayActivities })
      }

      // Advance by one day using UTC Date (safe: T00:00:00Z + 1 day = next day)
      const next = new Date(cur + 'T00:00:00Z')
      next.setUTCDate(next.getUTCDate() + 1)
      cur = next.toISOString().slice(0, 10)
    }
  })

  days.sort((a, b) => a.date.localeCompare(b.date))

  const tripStartStr = tripStartDate.slice(0, 10)
  const getDayNum = (dateStr: string) => {
    const msPerDay = 86400000
    const start = new Date(tripStartStr + 'T00:00:00Z').getTime()
    const cur2 = new Date(dateStr + 'T00:00:00Z').getTime()
    return Math.round((cur2 - start) / msPerDay) + 1
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const dayNum = getDayNum(day.date)
        return (
          <div key={`${day.date}-${day.stop.id}`} className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-white/8">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-400 text-xs font-bold">D{dayNum}</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{formatDate(day.date)}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> {day.stop.city.name}
                </div>
              </div>
              <div className="text-xs text-slate-600">
                {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
              </div>
            </div>
            <div className="p-4">
              {day.activities.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Free day - no activities planned</p>
              ) : (
                <div className="space-y-2">
                  {day.activities.map((sa) => (
                    <div key={sa.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5">
                      <div className="text-xs text-slate-500 w-16 flex-shrink-0 text-center">
                        {sa.scheduledTime
                          ? formatTime(sa.scheduledTime)
                          : <span className="italic text-slate-600">anytime</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{sa.activity.name}</div>
                        <span className={clsx('text-xs px-1.5 py-0.5 rounded-full capitalize', TYPE_COLORS[sa.activity.type] ?? 'bg-slate-500/15 text-slate-400')}>
                          {sa.activity.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-500">{sa.activity.durationMin}m</span>
                        <span className="text-xs text-amber-400 font-semibold">{formatCurrency(sa.activity.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

