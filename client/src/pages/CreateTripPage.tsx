import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Calendar, FileText, Loader2, ArrowRight } from 'lucide-react'
import { createTripSchema, type CreateTripInput } from '@globetrotter/shared'
import { useCreateTrip } from '../hooks/useTrips'
import { useCities } from '../hooks/useSearch'
import { ApiError } from '../api/apiClient'
import { getGradient } from '../lib/formatters'

export default function CreateTripPage() {
  const navigate = useNavigate()
  const createTrip = useCreateTrip()
  const { data: citiesData } = useCities({ limit: 6 })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, setError } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
  })

  const watchedStart = watch('startDate')

  // When start date changes, ensure end date is never before it
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value
    setValue('startDate', newStart)
    const currentEnd = watch('endDate')
    if (currentEnd && currentEnd < newStart) {
      setValue('endDate', newStart) // snap end to same day minimum
    }
  }

  const onSubmit = async (data: CreateTripInput) => {
    try {
      const trip = await createTrip.mutateAsync({
        ...data,
        startDate: data.startDate + 'T00:00:00Z',
        endDate: data.endDate + 'T00:00:00Z',
      })
      navigate(`/trips/${trip.id}/builder`)
    } catch (err) {
      if (err instanceof ApiError) setError('root', { message: err.message })
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Plan a new trip</h1>
        <p className="text-slate-400 text-sm mt-1">Give your adventure a name and set the dates</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Trip name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Trip name *</label>
            <input
              {...register('name')}
              placeholder="e.g., Goa & Kerala Backpacking"
              className="input"
              id="trip-name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <textarea
                {...register('description')}
                placeholder="What's this trip about?"
                className="input pl-10 resize-none h-20"
                id="trip-description"
              />
            </div>
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start date *</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  {...register('startDate')}
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={handleStartChange}
                  className="input pl-10"
                  id="trip-start-date"
                />
              </div>
              {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">End date *</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  {...register('endDate')}
                  type="date"
                  min={watchedStart || new Date().toISOString().slice(0, 10)}
                  className="input pl-10"
                  id="trip-end-date"
                />
              </div>
              {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate.message}</p>}
            </div>
          </div>

          {errors.root && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{errors.root.message}</p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
            {isSubmitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><span>Create trip & build itinerary</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      {/* Inspiration cities */}
      {citiesData && citiesData.cities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-widest">Popular Destinations</h2>
          <div className="grid grid-cols-3 gap-3">
            {citiesData.cities.slice(0, 6).map((city) => {
              const grad = getGradient(city.name)
              return (
                <div key={city.id} className={`relative overflow-hidden rounded-xl h-20 bg-gradient-to-br ${grad} cursor-pointer hover:-translate-y-0.5 transition-transform`}>
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-xs font-semibold text-white truncate">{city.name}</div>
                    <div className="text-xs text-white/60">{city.country}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
