import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/apiClient'
import type { City, Activity, Trip } from '@globetrotter/shared'

// ─── Cities ───────────────────────────────────────────────────────────────────
interface CityQuery { search?: string; country?: string; page?: number; limit?: number }

export function useCities(params: CityQuery = {}) {
  const qp = new URLSearchParams()
  if (params.search) qp.set('search', params.search)
  if (params.country) qp.set('country', params.country)
  if (params.page) qp.set('page', String(params.page))
  if (params.limit) qp.set('limit', String(params.limit))

  return useQuery({
    queryKey: ['cities', params],
    queryFn: () =>
      apiClient.get<{ cities: City[]; total: number }>(`/cities?${qp.toString()}`),
  })
}

export function useCreateCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; country?: string; costIndex?: number }) =>
      apiClient.post<{ city: City }>('/cities', data).then((d) => d.city),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  })
}


// ─── Activities ───────────────────────────────────────────────────────────────
interface ActivityQuery { cityId?: string; type?: string; maxCost?: number; page?: number; limit?: number }

export function useActivities(params: ActivityQuery = {}) {
  const qp = new URLSearchParams()
  if (params.cityId) qp.set('cityId', params.cityId)
  if (params.type) qp.set('type', params.type)
  if (params.maxCost !== undefined) qp.set('maxCost', String(params.maxCost))
  if (params.page) qp.set('page', String(params.page))
  if (params.limit) qp.set('limit', String(params.limit))

  return useQuery({
    queryKey: ['activities', params],
    queryFn: () =>
      apiClient.get<{ activities: (Activity & { city: { name: string; country: string } })[]; total: number }>(`/activities?${qp.toString()}`),
    enabled: !!params.cityId || params.cityId === undefined,
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      cityId: string
      name: string
      type: string
      cost?: number
      durationMin?: number
      description?: string
    }) =>
      apiClient.post<{ activity: Activity & { city: { name: string; country: string } } }>('/activities', data)
        .then((d) => d.activity),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['activities', { cityId: vars.cityId }] })
    },
  })
}


// ─── Public trips ────────────────────────────────────────────────────────────
interface PublicTripSummary {
  id: string; name: string; description: string | null;
  startDate: string; endDate: string; coverPhoto: string | null;
  shareSlug: string | null; stopCount: number;
  owner: { name: string; avatarUrl: string | null };
  firstCity: { name: string; country: string } | null;
}

export function usePublicTrips(page = 1) {
  return useQuery({
    queryKey: ['public-trips', page],
    queryFn: () =>
      apiClient.get<{ trips: PublicTripSummary[]; total: number; page: number; limit: number }>(
        `/public/trips?page=${page}&limit=12`
      ),
  })
}

export function usePublicTrip(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-trip', slug],
    queryFn: () => apiClient.get<{ trip: Trip }>(`/public/trips/${slug}`).then((d) => d.trip),
    enabled: !!slug,
  })
}

export function useCopyPublicTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) =>
      apiClient.post<{ trip: Trip }>(`/public/trips/${slug}/copy`).then((d) => d.trip),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get<{ totalUsers: number; totalTrips: number; topCities: { cityName: string; count: number }[]; topActivities: { activityName: string; count: number }[]; tripsCreatedLast7d: number }>('/admin/stats'),
  })
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => apiClient.get<{ users: unknown[]; total: number }>(`/admin/users?page=${page}&limit=20`),
  })
}

export function useAdminTrips(page = 1) {
  return useQuery({
    queryKey: ['admin', 'trips', page],
    queryFn: () => apiClient.get<{ trips: unknown[]; total: number }>(`/admin/trips?page=${page}&limit=20`),
  })
}
