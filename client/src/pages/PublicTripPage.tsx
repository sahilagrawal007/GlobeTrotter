import { useParams, Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Globe, Copy, MapPin, Calendar, Clock, Loader2, ArrowLeft, Share2 } from 'lucide-react'
import { usePublicTrip, useCopyPublicTrip } from '../hooks/useSearch'
import { formatCurrency, formatDateRange, getGradient, daysBetween } from '../lib/formatters'
import { clsx } from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'

const TYPE_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-500/15 text-blue-400',
  food: 'bg-orange-500/15 text-orange-400',
  adventure: 'bg-red-500/15 text-red-400',
  culture: 'bg-violet-500/15 text-violet-400',
  relaxation: 'bg-teal-500/15 text-teal-400',
}

export default function PublicTripPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: trip, isLoading } = usePublicTrip(slug)
  const copyTrip = useCopyPublicTrip()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!token) { navigate('/login'); return }
    const newTrip = await copyTrip.mutateAsync(slug!)
    navigate(`/trips/${newTrip.id}/builder`)
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
    </div>
  )
  if (!trip) return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-slate-400 gap-4">
      <Globe className="w-12 h-12 text-slate-600" />
      <h2 className="text-xl font-semibold text-white">Trip not found</h2>
      <p className="text-sm">This itinerary may have been made private.</p>
      <Link to="/explore" className="btn-primary mt-2">Browse public trips</Link>
    </div>
  )

  const grad = getGradient(trip.name)
  const nights = daysBetween(trip.startDate, trip.endDate)
  const totalCost = trip.stops.reduce((s, st) =>
    s + st.transportCost + st.stayCost + st.mealsCost + st.activities.reduce((a, sa) => a + (sa.activity?.cost ?? 0), 0), 0)

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <div className={`relative h-64 bg-gradient-to-br ${grad}`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-teal-300" />
            <span className="text-teal-300 text-sm font-medium">Public Itinerary</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{trip.name}</h1>
          {trip.description && <p className="text-white/70 text-sm">{trip.description}</p>}
        </div>
        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between max-w-4xl mx-auto">
          <Link to="/explore" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleShareLink} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-sm flex items-center gap-1.5 hover:bg-white/20 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Share'}
            </button>
            <button onClick={handleCopy} disabled={copyTrip.isPending} className="btn-primary text-sm">
              {copyTrip.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Copy className="w-3.5 h-3.5" /> Copy Trip</>}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-teal-400" />{formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-teal-400" />{trip.stops.length} cities</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-400" />{nights} nights</span>
          <span className="ml-auto text-lg font-bold text-teal-400">{formatCurrency(totalCost)}</span>
        </div>

        {/* Stops */}
        <div className="space-y-4">
          {trip.stops.map((stop) => {
            const stopGrad = getGradient(stop.city.name)
            const stopTotal = stop.transportCost + stop.stayCost + stop.mealsCost + stop.activities.reduce((s, sa) => s + (sa.activity?.cost ?? 0), 0)
            return (
              <div key={stop.id} className="glass-card overflow-hidden">
                <div className={`relative h-14 bg-gradient-to-r ${stopGrad}`}>
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative z-10 flex items-center justify-between h-full px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                      <span className="text-white font-semibold text-sm">{stop.city.name}</span>
                      <span className="text-white/60 text-xs">{stop.city.country}</span>
                    </div>
                    <span className="text-amber-300 font-bold text-sm">{formatCurrency(stopTotal)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: 'Transport', v: stop.transportCost },
                      { l: 'Stay', v: stop.stayCost },
                      { l: 'Meals', v: stop.mealsCost },
                      { l: 'Activities', v: stop.activities.reduce((s, sa) => s + (sa.activity?.cost ?? 0), 0) },
                    ].map((item) => (
                      <div key={item.l} className="text-center p-2 rounded-lg bg-white/3">
                        <div className="text-xs text-slate-500">{item.l}</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{formatCurrency(item.v)}</div>
                      </div>
                    ))}
                  </div>
                  {stop.activities.length > 0 && (
                    <div className="space-y-1.5">
                      {stop.activities.map((sa) => (
                        <div key={sa.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full capitalize', TYPE_COLORS[sa.activity.type] ?? 'bg-slate-500/15 text-slate-400')}>{sa.activity.type}</span>
                          <span className="flex-1 text-sm text-white">{sa.activity.name}</span>
                          <span className="text-xs text-amber-400 font-medium">{formatCurrency(sa.activity.cost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="glass-card p-6 text-center">
          <h3 className="text-white font-semibold mb-2">Inspired by this trip?</h3>
          <p className="text-slate-400 text-sm mb-4">Copy it to your account and customize it however you like.</p>
          <button onClick={handleCopy} disabled={copyTrip.isPending} className="btn-primary">
            {copyTrip.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Copy className="w-4 h-4" /> Copy this itinerary</>}
          </button>
        </div>
      </div>
    </div>
  )
}
