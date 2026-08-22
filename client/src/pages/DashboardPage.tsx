import { Link } from 'react-router-dom'
import { Plus, MapPin, TrendingUp, Calendar, ChevronRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useTrips } from '../hooks/useTrips'
import { useCities } from '../hooks/useSearch'
import { formatDateRange, getTripStatus, getGradient, formatCurrency } from '../lib/formatters'
import type { TripSummary } from '@globetrotter/shared'
import TripCard from '../components/TripCard'

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function CityCard({ city }: { city: { id: string; name: string; country: string; costIndex: number } }) {
  const grad = getGradient(city.name)
  const costLabel = ['', '₹', '₹₹', '₹₹₹', '₹₹₹₹', '₹₹₹₹₹'][city.costIndex] ?? '₹₹₹'
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} h-32 cursor-pointer group hover:-translate-y-1 transition-all duration-300 hover:shadow-glow-teal`}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-sm font-bold text-white">{city.name}</div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/70">{city.country}</div>
          <div className="text-xs text-amber-300 font-medium">{costLabel}</div>
        </div>
      </div>
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <MapPin className="w-3 h-3 text-white" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: trips, isLoading: tripsLoading } = useTrips()
  const { data: citiesData } = useCities({ limit: 8 })

  const ongoing = trips?.filter((t) => getTripStatus(t.startDate, t.endDate) === 'ongoing') ?? []
  const upcoming = trips?.filter((t) => getTripStatus(t.startDate, t.endDate) === 'upcoming') ?? []
  const recent = trips?.slice(0, 6) ?? []
  const totalBudget = 0 // No way to sum without budget endpoint per trip on list view

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 border border-white/8 p-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-60 h-60 bg-amber-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{greeting},</p>
            <h1 className="text-3xl font-bold text-white mb-3">
              {user?.name?.split(' ')[0] ?? 'Traveler'}
            </h1>
            <p className="text-slate-400 max-w-md">
              {ongoing.length > 0
                ? `You have ${ongoing.length} trip in progress. Keep exploring!`
                : upcoming.length > 0
                ? `${upcoming.length} upcoming trip${upcoming.length > 1 ? 's' : ''} - the adventure awaits!`
                : 'Ready to plan your next adventure? Let\'s go!'}
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/trips/new" className="btn-primary">
                <Plus className="w-4 h-4" /> Plan a Trip
              </Link>
              <Link to="/explore" className="btn-ghost">
                <Sparkles className="w-4 h-4" /> Explore
              </Link>
            </div>
          </div>
          <div className="hidden xl:block text-8xl animate-float select-none">🌍</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trips" value={trips?.length ?? 0} icon={MapPin} color="bg-teal-500/15 text-teal-400" />
        <StatCard label="Ongoing" value={ongoing.length} icon={TrendingUp} color="bg-amber-500/15 text-amber-400" />
        <StatCard label="Upcoming" value={upcoming.length} icon={Calendar} color="bg-violet-500/15 text-violet-400" />
        <StatCard label="Cities" value={citiesData?.total ?? '20+'} icon={MapPin} color="bg-rose-500/15 text-rose-400" />
      </div>

      {/* Top Destinations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Top Destinations</h2>
          <Link to="/explore" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {citiesData?.cities.slice(0, 8).map((city) => (
            <CityCard key={city.id} city={city} />
          )) ?? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Recent Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">My Trips</h2>
          <Link to="/trips" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1">
            All trips <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {tripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-semibold text-white mb-2">No trips yet</h3>
            <p className="text-slate-400 mb-6 text-sm">Plan your first adventure and build a beautiful itinerary.</p>
            <Link to="/trips/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Plan a Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((trip) => <TripCard key={trip.id} trip={trip} />)}
          </div>
        )}
      </div>
    </div>
  )
}
