import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Plus, ChevronUp, ChevronDown, Trash2, X, Search,
  MapPin, Clock, Loader2, Eye, BarChart2, Pencil, CalendarDays, FileText,
} from 'lucide-react'
import { useTrip, useUpdateTrip } from '../hooks/useTrips'
import { useAddStop, useUpdateStop, useDeleteStop, useReorderStops, useAddStopActivity, useDeleteStopActivity } from '../hooks/useStops'
import { useCities, useActivities, useCreateCity, useCreateActivity } from '../hooks/useSearch'
import { formatCurrency, formatDate, getGradient, daysBetween } from '../lib/formatters'
import type { Stop, City, Activity, Trip } from '@globetrotter/shared'
import { clsx } from 'clsx'

const ACTIVITY_TYPES = ['sightseeing', 'food', 'adventure', 'culture', 'relaxation']
const TYPE_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-500/15 text-blue-400',
  food: 'bg-orange-500/15 text-orange-400',
  adventure: 'bg-red-500/15 text-red-400',
  culture: 'bg-violet-500/15 text-violet-400',
  relaxation: 'bg-teal-500/15 text-teal-400',
}

// ─── Add Stop Modal ──────────────────────────────────────────────────────────
function AddStopModal({ tripId, tripStart, tripEnd, onClose }: {
  tripId: string
  tripStart: string  // YYYY-MM-DD
  tripEnd: string    // YYYY-MM-DD
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<City | null>(null)
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const { data } = useCities({ search: search.length >= 1 ? search : undefined, limit: 8 })
  const addStop = useAddStop(tripId)
  const createCity = useCreateCity()

  const hasResults = data && data.cities.length > 0
  // Show "add custom" when user has typed something but no city is selected yet
  const showCustomOption = search.trim().length >= 2 && !selected

  const handleSelectCity = (c: City) => {
    setSelected(c)
    setSearch(c.name)
    setShowCustom(false)
  }

  const handleUseCustom = () => {
    // Clear selected DB city and mark as custom
    setSelected(null)
    setShowCustom(true)
  }

  const handleAdd = async () => {
    if (!startDate || !endDate) return

    let cityToUse = selected

    // If user chose custom, create the city first
    if (showCustom && !selected) {
      if (!search.trim()) return
      cityToUse = await createCity.mutateAsync({
        name: search.trim(),
        country: country.trim() || undefined,
      })
    }

    if (!cityToUse) return

    await addStop.mutateAsync({
      cityId: cityToUse.id,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate + 'T23:59:59').toISOString(),
    })
    onClose()
  }

  const isPending = addStop.isPending || createCity.isPending
  const canSubmit = (selected || showCustom) && startDate && endDate && !isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-elevated p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add a stop</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* City search */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Search or type a destination</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelected(null); setShowCustom(false) }}
              placeholder="e.g. Hanoi, Ho Chi Minh City..."
              className="input pl-9 text-sm"
              id="stop-city-search"
              autoFocus
            />
            {/* Clear selected indicator */}
            {selected && (
              <button
                onClick={() => { setSelected(null); setSearch(''); setShowCustom(false) }}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selected city chip */}
          {selected && (
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${getGradient(selected.name)} flex-shrink-0`} />
              <span className="text-sm text-teal-300 font-medium">{selected.name}</span>
              <span className="text-xs text-slate-500">{selected.country}</span>
            </div>
          )}

          {/* Custom city chip */}
          {showCustom && !selected && (
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-300 font-medium">Custom: {search.trim()}</span>
              <button onClick={() => setShowCustom(false)} className="ml-auto text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Search results dropdown */}
          {!selected && !showCustom && search.trim().length >= 1 && (
            <div className="mt-1 glass-elevated rounded-xl overflow-hidden divide-y divide-white/5 max-h-52 overflow-y-auto">
              {/* Matched cities */}
              {data?.cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCity(c)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getGradient(c.name)} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.country}</div>
                  </div>
                </button>
              ))}

              {/* Custom city option - always shown if user typed enough */}
              {showCustomOption && (
                <button
                  onClick={handleUseCustom}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-500/5 transition-colors text-left border-t border-white/8"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm text-amber-300 font-medium">Add "{search.trim()}" as custom destination</div>
                    <div className="text-xs text-slate-500">Not in the list? Add it manually</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Country field for custom cities */}
        {showCustom && !selected && (
          <div className="mb-3 animate-slide-up">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Country <span className="text-slate-600">(optional)</span></label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Vietnam"
              className="input text-sm"
              id="stop-custom-country"
            />
          </div>
        )}

        {/* Dates — constrained to trip's date range */}
        <div className="mb-3 p-2.5 rounded-xl bg-teal-500/5 border border-teal-500/10">
          <p className="text-xs text-teal-400/70 mb-2">Stay within trip dates: <span className="font-medium text-teal-400">{tripStart} to {tripEnd}</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Arrival</label>
              <input
                type="date"
                value={startDate}
                min={tripStart}
                max={tripEnd}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-sm"
                id="stop-start-date"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Departure</label>
              <input
                type="date"
                value={endDate}
                min={startDate || tripStart}
                max={tripEnd}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-sm"
                id="stop-end-date"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!canSubmit}
            className="btn-primary flex-1"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Stop'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Activity Picker Drawer ──────────────────────────────────────────────────
function ActivityPicker({ tripId, stop, onClose }: { tripId: string; stop: Stop; onClose: () => void }) {
  const [typeFilter, setTypeFilter] = useState('')
  const [maxCost, setMaxCost] = useState(50000)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState('sightseeing')
  const [customCost, setCustomCost] = useState('')
  const [customDuration, setCustomDuration] = useState('60')
  const [customDesc, setCustomDesc] = useState('')

  const { data } = useActivities({ cityId: stop.cityId, type: typeFilter || undefined, maxCost })
  const addAct = useAddStopActivity(tripId)
  const createAct = useCreateActivity()
  const addedIds = new Set(stop.activities.map((sa) => sa.activityId))

  const handleCreateCustom = async () => {
    if (!customName.trim()) return
    const newAct = await createAct.mutateAsync({
      cityId: stop.cityId,
      name: customName.trim(),
      type: customType,
      cost: parseFloat(customCost) || 0,
      durationMin: parseInt(customDuration) || 60,
      description: customDesc.trim() || undefined,
    })
    // Immediately add it to the stop
    await addAct.mutateAsync({ stopId: stop.id, data: { activityId: newAct.id } })
    // Reset form
    setCustomName(''); setCustomCost(''); setCustomDuration('60'); setCustomDesc('')
    setShowCustomForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-elevated w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/8 flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white">Activities - {stop.city.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pick from the list or create a custom one</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-white/8 space-y-2.5 flex-shrink-0">
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setTypeFilter('')} className={clsx('text-xs px-2.5 py-1 rounded-full transition-all', !typeFilter ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-slate-400 hover:text-white')}>All</button>
            {ACTIVITY_TYPES.map((t) => (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)} className={clsx('text-xs px-2.5 py-1 rounded-full capitalize transition-all', typeFilter === t ? TYPE_COLORS[t] : 'bg-white/5 text-slate-400 hover:text-white')}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-16 flex-shrink-0">Max cost</span>
            <input type="range" min={0} max={50000} step={500} value={maxCost} onChange={(e) => setMaxCost(Number(e.target.value))} className="flex-1 accent-teal-500" />
            <span className="text-xs text-teal-400 w-20 text-right flex-shrink-0">{formatCurrency(maxCost)}</span>
          </div>
        </div>

        {/* Activity list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {data && data.activities.length === 0 && !showCustomForm && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-slate-500 text-sm">No activities found for this city yet.</p>
              <p className="text-slate-600 text-xs mt-1">Create a custom activity below!</p>
            </div>
          )}
          {data?.activities.map((act) => {
            const added = addedIds.has(act.id)
            return (
              <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{act.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full capitalize', TYPE_COLORS[act.type] ?? 'bg-slate-500/15 text-slate-400')}>{act.type}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{act.durationMin}m</span>
                    <span className="text-xs text-amber-400 font-medium">{formatCurrency(act.cost)}</span>
                  </div>
                </div>
                <button
                  disabled={added || addAct.isPending}
                  onClick={() => addAct.mutate({ stopId: stop.id, data: { activityId: act.id } })}
                  className={clsx('text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0', added ? 'bg-teal-500/10 text-teal-500 cursor-default' : 'btn-primary py-1.5 text-xs')}
                >
                  {added ? '✓ Added' : '+ Add'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Custom activity section */}
        <div className="border-t border-white/8 flex-shrink-0">
          <button
            onClick={() => setShowCustomForm((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-amber-400 hover:bg-amber-500/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create custom activity
            </span>
            <span className="text-xs text-slate-500">{showCustomForm ? 'Cancel' : 'Not in the list?'}</span>
          </button>

          {showCustomForm && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              {/* Name + Type row */}
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Activity name *</label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Street food tour"
                    className="input text-sm"
                    id="custom-activity-name"
                    autoFocus
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type *</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="input text-sm capitalize"
                    id="custom-activity-type"
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-navy-800 capitalize">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost + Duration row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cost (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customCost}
                      onChange={(e) => setCustomCost(e.target.value)}
                      placeholder="0"
                      min={0}
                      className="input text-sm pl-8"
                      id="custom-activity-cost"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration (min)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="60"
                      min={1}
                      className="input text-sm pl-8"
                      id="custom-activity-duration"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes <span className="text-slate-600">(optional)</span></label>
                <input
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Any details..."
                  className="input text-sm"
                  id="custom-activity-desc"
                />
              </div>

              <button
                onClick={handleCreateCustom}
                disabled={!customName.trim() || createAct.isPending || addAct.isPending}
                className="btn-primary w-full text-sm"
              >
                {createAct.isPending || addAct.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Plus className="w-4 h-4" /> Create & Add to Stop</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// ─── Edit Trip Modal ──────────────────────────────────────────────────────────
function EditTripModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const updateTrip = useUpdateTrip(trip.id)
  const [name, setName] = useState(trip.name)
  const [description, setDescription] = useState(trip.description ?? '')
  const [startDate, setStartDate] = useState(trip.startDate.slice(0, 10))
  const [endDate, setEndDate] = useState(trip.endDate.slice(0, 10))
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Trip name is required'); return }
    if (endDate < startDate) { setError('End date must be on or after start date'); return }
    setError('')
    await updateTrip.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate + 'T23:59:59').toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-elevated p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Edit trip details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Trip name *</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-10"
                id="edit-trip-name"
                placeholder="e.g. Goa & Kerala Backpacking"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description <span className="text-slate-600">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none h-20"
              id="edit-trip-description"
              placeholder="What's this trip about?"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                <CalendarDays className="inline w-3.5 h-3.5 mr-1 text-teal-400" />Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (endDate < e.target.value) setEndDate(e.target.value)
                }}
                className="input text-sm"
                id="edit-trip-start"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                <CalendarDays className="inline w-3.5 h-3.5 mr-1 text-teal-400" />End date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-sm"
                id="edit-trip-end"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSave}
              disabled={updateTrip.isPending}
              className="btn-primary flex-1"
            >
              {updateTrip.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Stop Card ───────────────────────────────────────────────────────────────────────
function StopCard({ tripId, stop, index, total, tripStart, tripEnd, allStopIds }: {
  tripId: string; stop: Stop; index: number; total: number
  tripStart: string; tripEnd: string; allStopIds: string[]
}) {
  const [showPicker, setShowPicker] = useState(false)
  // Controlled state for dates — initialised from server data.
  // Using useState (not defaultValue) so min/max constraints update reactively
  // when trip dates change (e.g. after copying a trip or editing trip details).
  const [arrivalVal, setArrivalVal] = useState(stop.startDate.slice(0, 10))
  const [departureVal, setDepartureVal] = useState(stop.endDate.slice(0, 10))

  const updateStop = useUpdateStop(tripId)
  const deleteStop = useDeleteStop(tripId)
  const reorder = useReorderStops(tripId)
  const delAct = useDeleteStopActivity(tripId)
  const grad = getGradient(stop.city.name)

  const stopTotal = stop.transportCost + stop.stayCost + stop.mealsCost + stop.activities.reduce((s, sa) => s + (sa.activity?.cost ?? 0), 0)
  const nights = daysBetween(stop.startDate, stop.endDate)

  const handleCostChange = (field: 'transportCost' | 'stayCost' | 'mealsCost', value: string) => {
    updateStop.mutate({ stopId: stop.id, data: { [field]: parseFloat(value) || 0 } })
  }

  const handleArrivalChange = (value: string) => {
    if (!value) return
    setArrivalVal(value)
    // If departure would be before new arrival, snap it forward
    if (departureVal < value) setDepartureVal(value)
    updateStop.mutate({ stopId: stop.id, data: { startDate: new Date(value + 'T00:00:00').toISOString() } })
  }

  const handleDepartureChange = (value: string) => {
    if (!value) return
    setDepartureVal(value)
    updateStop.mutate({ stopId: stop.id, data: { endDate: new Date(value + 'T23:59:59').toISOString() } })
  }

  const handleReorder = (dir: 'up' | 'down') => {
    const ids = [...allStopIds]
    const swapIdx = dir === 'up' ? index - 1 : index + 1
    ;[ids[index], ids[swapIdx]] = [ids[swapIdx], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <>
      <div className="glass-card overflow-hidden animate-slide-up">
        {/* City header */}
        <div className={`relative h-16 bg-gradient-to-r ${grad}`}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
              <div>
                <div className="font-semibold text-white text-sm">{stop.city.name}</div>
                <div className="text-xs text-white/70">{stop.city.country} · {nights} night{nights !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleReorder('up')}
                disabled={index === 0 || reorder.isPending}
                className="p-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-30"
                title="Move up"
              ><ChevronUp className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => handleReorder('down')}
                disabled={index === total - 1 || reorder.isPending}
                className="p-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-30"
                title="Move down"
              ><ChevronDown className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => deleteStop.mutate(stop.id)}
                className="p-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 ml-1"
                title="Remove stop"
              ><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Editable Dates */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-teal-400" /> Dates
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Arrival</div>
                <input
                  key={`${stop.id}-start`}
                  type="date"
                  value={arrivalVal}
                  min={tripStart}
                  max={tripEnd}
                  onChange={(e) => handleArrivalChange(e.target.value)}
                  className="input text-sm py-1.5"
                  id={`stop-${stop.id}-start`}
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Departure</div>
                <input
                  key={`${stop.id}-end`}
                  type="date"
                  value={departureVal}
                  min={arrivalVal}
                  max={tripEnd}
                  onChange={(e) => handleDepartureChange(e.target.value)}
                  className="input text-sm py-1.5"
                  id={`stop-${stop.id}-end`}
                />
              </div>
            </div>
          </div>

          {/* Budget inputs */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">Budget (₹)</div>
            <div className="grid grid-cols-3 gap-2">
              {(['transportCost', 'stayCost', 'mealsCost'] as const).map((field) => (
                <div key={field}>
                  <div className="text-xs text-slate-500 mb-1 capitalize">{field.replace('Cost', '').replace('transport', 'Transport').replace('stay', 'Stay').replace('meals', 'Meals')}</div>
                  <input
                    type="number"
                    defaultValue={stop[field]}
                    onBlur={(e) => handleCostChange(field, e.target.value)}
                    className="input text-sm py-2 text-center"
                    id={`stop-${stop.id}-${field}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-slate-400">Activities ({stop.activities.length})</div>
              <button onClick={() => setShowPicker(true)} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {stop.activities.length === 0 ? (
              <button onClick={() => setShowPicker(true)} className="w-full py-3 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:border-teal-500/30 hover:text-teal-400 transition-all">
                + Pick activities for {stop.city.name}
              </button>
            ) : (
              <div className="space-y-1.5">
                {stop.activities.map((sa) => (
                  <div key={sa.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 group">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded capitalize', TYPE_COLORS[sa.activity.type] ?? 'bg-slate-500/15 text-slate-400')}>{sa.activity.type[0].toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate">{sa.activity.name}</div>
                    </div>
                    <div className="text-xs text-amber-400">{formatCurrency(sa.activity.cost)}</div>
                    <button onClick={() => delAct.mutate({ stopId: stop.id, stopActivityId: sa.id })} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stop total */}
          <div className="pt-2 border-t border-white/8 flex items-center justify-between">
            <span className="text-xs text-slate-500">Stop total</span>
            <span className="text-sm font-bold text-teal-400">{formatCurrency(stopTotal)}</span>
          </div>
        </div>
      </div>

      {showPicker && <ActivityPicker tripId={tripId} stop={stop} onClose={() => setShowPicker(false)} />}
    </>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ItineraryBuilderPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)
  const [showAddStop, setShowAddStop] = useState(false)
  const [showEditTrip, setShowEditTrip] = useState(false)

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
    </div>
  )

  if (!trip) return (
    <div className="text-center py-20 text-slate-400">Trip not found</div>
  )

  const tripStart = trip.startDate.slice(0, 10)
  const tripEnd = trip.endDate.slice(0, 10)

  const totalBudget = trip.stops.reduce((sum, s) => {
    return sum + s.transportCost + s.stayCost + s.mealsCost + s.activities.reduce((a, sa) => a + (sa.activity?.cost ?? 0), 0)
  }, 0)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white truncate">{trip.name}</h1>
            <button
              onClick={() => setShowEditTrip(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-400 hover:bg-teal-500/10 transition-all flex-shrink-0"
              title="Edit trip details"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {trip.description || 'Build your itinerary stop by stop'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={`/trips/${tripId}`} className="btn-ghost text-sm">
            <Eye className="w-4 h-4" /> View
          </Link>
          <Link to={`/trips/${tripId}/budget`} className="btn-ghost text-sm">
            <BarChart2 className="w-4 h-4" /> Budget
          </Link>
        </div>
      </div>

      {/* Trip summary bar */}
      <div className="glass-card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-xs text-slate-500">Dates</div>
            <div className="text-white font-medium text-xs">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Stops</div>
            <div className="text-white font-semibold">{trip.stops.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Total Budget</div>
            <div className="text-teal-400 font-semibold">{formatCurrency(totalBudget)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Activities</div>
            <div className="text-white font-semibold">{trip.stops.reduce((s, st) => s + st.activities.length, 0)}</div>
          </div>
        </div>
        <button onClick={() => setShowAddStop(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Stop
        </button>
      </div>

      {/* Stops */}
      {trip.stops.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="text-lg font-semibold text-white mb-2">No stops yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add your first destination to start building your itinerary.</p>
          <button onClick={() => setShowAddStop(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add First Stop
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trip.stops.map((stop, i) => (
            <StopCard
              key={stop.id}
              tripId={tripId!}
              stop={stop}
              index={i}
              total={trip.stops.length}
              tripStart={tripStart}
              tripEnd={tripEnd}
              allStopIds={trip.stops.map((s) => s.id)}
            />
          ))}
          <button
            onClick={() => setShowAddStop(true)}
            className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:border-teal-500/30 hover:text-teal-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add another stop
          </button>
        </div>
      )}

      {showAddStop && (
        <AddStopModal
          tripId={tripId!}
          tripStart={tripStart}
          tripEnd={tripEnd}
          onClose={() => setShowAddStop(false)}
        />
      )}

      {showEditTrip && (
        <EditTripModal
          trip={trip}
          onClose={() => setShowEditTrip(false)}
        />
      )}
    </div>
  )
}
