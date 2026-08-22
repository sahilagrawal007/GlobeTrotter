import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/apiClient'
import type { Stop, StopActivity } from '@globetrotter/shared'

export function useAddStop(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { cityId: string; startDate: string; endDate: string; order?: number }) =>
      apiClient.post<{ stop: Stop }>(`/trips/${tripId}/stops`, data).then((d) => d.stop),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}

export function useUpdateStop(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string; data: Partial<{ startDate: string; endDate: string; order: number; transportCost: number; stayCost: number; mealsCost: number }> }) =>
      apiClient.patch<{ stop: Stop }>(`/trips/${tripId}/stops/${stopId}`, data).then((d) => d.stop),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}

export function useDeleteStop(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stopId: string) => apiClient.delete<{ success: boolean }>(`/trips/${tripId}/stops/${stopId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}

export function useReorderStops(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stopIds: string[]) =>
      apiClient.patch<{ stops: Stop[] }>(`/trips/${tripId}/stops/reorder`, { stopIds }).then((d) => d.stops),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}

export function useAddStopActivity(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string; data: { activityId: string; scheduledTime?: string } }) =>
      apiClient.post<{ stopActivity: StopActivity }>(`/trips/${tripId}/stops/${stopId}/activities`, data).then((d) => d.stopActivity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}

export function useDeleteStopActivity(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ stopId, stopActivityId }: { stopId: string; stopActivityId: string }) =>
      apiClient.delete<{ success: boolean }>(`/trips/${tripId}/stops/${stopId}/activities/${stopActivityId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}
