import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { User, Edit3, Check, X, Loader2, MapPin, Calendar, Trash2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useDeleteAccount } from '../hooks/useAuth'
import { useTrips } from '../hooks/useTrips'
import { formatDateRange, getTripStatus, getGradient } from '../lib/formatters'
import { ApiError } from '../api/apiClient'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const deleteAccount = useDeleteAccount()
  const { data: trips } = useTrips()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const preplanned = trips?.filter((t) => getTripStatus(t.startDate, t.endDate) === 'upcoming') ?? []
  const previous  = trips?.filter((t) => getTripStatus(t.startDate, t.endDate) === 'completed') ?? []
  const ongoing   = trips?.filter((t) => getTripStatus(t.startDate, t.endDate) === 'ongoing') ?? []

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ name })
      setEditing(false)
      setError('')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Profile card */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-navy-900 border border-white/10 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input text-lg font-bold py-1.5"
                  id="profile-name-input"
                  autoFocus
                />
                <button onClick={handleSave} disabled={updateProfile.isPending} className="btn-primary px-3 py-1.5">
                  {updateProfile.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setEditing(false); setName(user?.name ?? '') }} className="btn-ghost px-3 py-1.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-400 mb-1">{error}</p>}
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`pill ${user?.role === 'admin' ? 'pill-ongoing' : 'pill-upcoming'}`}>
                {user?.role === 'admin' ? '🛡️ Admin' : '🌍 Traveler'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/8">
          {[
            { label: 'Total Trips', value: trips?.length ?? 0 },
            { label: 'Upcoming', value: preplanned.length },
            { label: 'Completed', value: previous.length },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-white/3">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ongoing */}
      {ongoing.length > 0 && (
        <TripSection title="Currently Ongoing" trips={ongoing} />
      )}

      {/* Pre-planned trips */}
      {preplanned.length > 0 && (
        <TripSection title="Upcoming Trips" trips={preplanned} />
      )}

      {/* Previous trips */}
      {previous.length > 0 && (
        <TripSection title="Past Trips" trips={previous} />
      )}

      {/* Danger zone */}
      <div className="glass-card p-6 border border-red-500/10">
        <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-300">Delete Account</div>
            <div className="text-xs text-slate-500">Permanently delete your account and all trip data</div>
          </div>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-elevated p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete account?</h3>
                <p className="text-slate-400 text-xs">All your trips will be lost forever.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => deleteAccount.mutate()} disabled={deleteAccount.isPending} className="btn-danger flex-1">
                {deleteAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TripSection({ title, trips }: { title: string; trips: { id: string; name: string; startDate: string; endDate: string; stopCount: number }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {trips.map((t) => {
          const grad = getGradient(t.name)
          return (
            <Link key={t.id} to={`/trips/${t.id}`} className={`relative overflow-hidden rounded-xl h-24 bg-gradient-to-br ${grad} group hover:-translate-y-0.5 transition-transform`}>
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-xs font-semibold text-white truncate">{t.name}</div>
                <div className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-2.5 h-2.5" /> {formatDateRange(t.startDate, t.endDate)}
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/80 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" /> {t.stopCount}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
