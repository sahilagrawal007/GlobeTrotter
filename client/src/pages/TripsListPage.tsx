import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Filter, Trash2, AlertTriangle } from 'lucide-react'
import { useTrips, useDeleteTrip } from '../hooks/useTrips'
import { getTripStatus } from '../lib/formatters'
import TripCard from '../components/TripCard'
import type { TripSummary } from '@globetrotter/shared'

type Tab = 'all' | 'ongoing' | 'upcoming' | 'completed'

export default function TripsListPage() {
  const { data: trips, isLoading } = useTrips()
  const deleteTrip = useDeleteTrip()
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = (trips ?? []).filter((t) => {
    const matchesTab = tab === 'all' || getTripStatus(t.startDate, t.endDate) === tab
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteTrip.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Trips</h1>
          <p className="text-slate-400 text-sm mt-0.5">{trips?.length ?? 0} trips total</p>
        </div>
        <Link to="/trips/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Trip
        </Link>
      </div>

      {/* Search + tabs */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="input pl-10"
            id="trips-search"
          />
        </div>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={tab === t.key ? 'tab-btn-active' : 'tab-btn'}
            >
              {t.label}
              {t.key !== 'all' && (
                <span className="ml-1 text-xs opacity-60">
                  ({(trips ?? []).filter((tr) => getTripStatus(tr.startDate, tr.endDate) === t.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trip grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {search ? 'No trips match your search' : 'No trips here yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {search ? 'Try a different search term.' : 'Start planning your first adventure!'}
          </p>
          {!search && (
            <Link to="/trips/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Plan a Trip
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-elevated p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete trip?</h3>
                <p className="text-slate-400 text-xs">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleteTrip.isPending}
                className="btn-danger flex-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
