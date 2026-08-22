import { Link } from 'react-router-dom'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import type { TripSummary } from '@globetrotter/shared'
import { formatDateRange, getTripStatus, getGradient } from '../lib/formatters'
import { clsx } from 'clsx'

interface Props { trip: TripSummary; onDelete?: (id: string) => void }

export default function TripCard({ trip, onDelete }: Props) {
  const status = getTripStatus(trip.startDate, trip.endDate)
  const grad = getGradient(trip.name)

  return (
    <div className="trip-card group overflow-hidden">
      {/* Cover gradient */}
      <div className={`relative h-32 bg-gradient-to-br ${grad}`}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Status pill */}
        <div className="absolute top-3 left-3">
          <span className={clsx('pill', {
            'pill-ongoing': status === 'ongoing',
            'pill-upcoming': status === 'upcoming',
            'pill-done': status === 'completed',
          })}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', {
              'bg-teal-400': status === 'ongoing',
              'bg-amber-400': status === 'upcoming',
              'bg-slate-400': status === 'completed',
            })} />
            {status === 'ongoing' ? 'Ongoing' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </span>
        </div>
        {/* Stop count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 text-white text-xs">
          <MapPin className="w-2.5 h-2.5" />
          {trip.stopCount} {trip.stopCount === 1 ? 'stop' : 'stops'}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-teal-300 transition-colors">
          {trip.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <Calendar className="w-3 h-3" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/trips/${trip.id}`}
            className="flex-1 text-xs text-center py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all"
          >
            View
          </Link>
          <Link
            to={`/trips/${trip.id}/builder`}
            className="flex-1 text-xs text-center py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(trip.id) }}
              className="text-xs py-1.5 px-2 rounded-lg text-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
