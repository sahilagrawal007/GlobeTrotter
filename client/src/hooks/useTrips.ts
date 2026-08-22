import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/apiClient'
import type { Trip, TripSummary, BudgetBreakdown } from '@globetrotter/shared'

// ─── Trips ───────────────────────────────────────────────────────────────────
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.get<{ trips: TripSummary[] }>('/trips').then((d) => d.trips),
  })
}

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: () => apiClient.get<{ trip: Trip }>(`/trips/${tripId}`).then((d) => d.trip),
    enabled: !!tripId,
  })
}

export function useTripBudget(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trips', tripId, 'budget'],
    queryFn: () =>
      apiClient.get<{ breakdown: BudgetBreakdown }>(`/trips/${tripId}/budget`).then((d) => d.breakdown),
    enabled: !!tripId,
  })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      startDate: string
      endDate: string
      coverPhoto?: string
    }) => apiClient.post<{ trip: Trip }>('/trips', data).then((d) => d.trip),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ name: string; description: string; startDate: string; endDate: string; coverPhoto: string }>) =>
      apiClient.patch<{ trip: Trip }>(`/trips/${tripId}`, data).then((d) => d.trip),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['trips', tripId] })
    },
  })
}

export function useDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tripId: string) => apiClient.delete<{ success: boolean }>(`/trips/${tripId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useShareTrip(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (isPublic: boolean) =>
      apiClient.patch<{ trip: Trip }>(`/trips/${tripId}/share`, { isPublic }).then((d) => d.trip),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['trips', tripId] })
    },
  })
}
