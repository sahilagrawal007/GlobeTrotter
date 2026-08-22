import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, Globe, Users, MapPin, Calendar, Loader2, Search } from 'lucide-react'
import { usePublicTrips, useCopyPublicTrip } from '../hooks/useSearch'
import { formatDateRange, getGradient, daysBetween } from '../lib/formatters'
import { clsx } from 'clsx'

function PublicTripCard({ trip }: {
  trip: {
    id: string; name: string; description: string | null;
    startDate: string; endDate: string; coverPhoto: string | null;
    shareSlug: string | null; stopCount: number;
    owner: { name: string; avatarUrl: string | null };
    firstCity: { name: string; country: string } | null;
  }
}) {
  const copy = useCopyPublicTrip()
  const navigate = useNavigate()
  const grad = getGradient(trip.name)
  const nights = daysBetween(trip.startDate, trip.endDate)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    const newTrip = await copy.mutateAsync(trip.shareSlug!)
    navigate(`/trips/${newTrip.id}/builder`)
  }

  return (
    <div className="glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-glow-teal cursor-pointer">
      {/* Cover */}
      <div className={`relative h-36 bg-gradient-to-br ${grad}`}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Owner badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full bg-black/30">
          <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
            {trip.owner.name[0].toUpperCase()}
          </div>
          <span className="text-white text-xs">{trip.owner.name}</span>
        </div>
        {/* Globe badge */}
        <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30">
          <Globe className="w-3.5 h-3.5 text-teal-300" />
        </div>
        {/* City + nights */}
        <div className="absolute bottom-3 left-3 text-white">
          {trip.firstCity && <div className="text-sm font-bold">{trip.firstCity.name}</div>}
          <div className="text-xs text-white/70">{nights} nights</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-teal-300 transition-colors">
          {trip.name}
        </h3>
        {trip.description && (
          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{trip.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.stopCount} stops</span>
        </div>
        <div className="flex gap-2">
          {trip.shareSlug && (
            <Link to={`/share/${trip.shareSlug}`} className="flex-1 text-xs text-center py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
              View
            </Link>
          )}
          {trip.shareSlug && (
            <button
              onClick={handleCopy}
              disabled={copy.isPending}
              className="flex-1 text-xs py-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-all flex items-center justify-center gap-1"
            >
              {copy.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Copy className="w-3 h-3" /> Copy trip</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePublicTrips(page)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-teal-400" /> Community Trips
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Discover public itineraries shared by other travelers - get inspired or copy a trip to customize it
        </p>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users className="w-4 h-4" />
          <span>{data.total} public itinerar{data.total === 1 ? 'y' : 'ies'} from the community</span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : !data || data.trips.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-4xl mb-3">🌐</div>
          <h3 className="text-lg font-semibold text-white mb-2">No public trips yet</h3>
          <p className="text-slate-400 text-sm">Be the first to share your itinerary with the community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.trips.map((trip) => <PublicTripCard key={trip.id} trip={trip} />)}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > data.limit && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-30">
            ← Prev
          </button>
          <span className="flex items-center text-sm text-slate-400">
            Page {page} of {Math.ceil(data.total / data.limit)}
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / data.limit)} className="btn-ghost text-sm disabled:opacity-30">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
