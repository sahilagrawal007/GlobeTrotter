import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../api/apiClient'

export interface AISuggestion {
  title: string
  description: string
}

export interface AIBudgetEstimate {
  total: number
  breakdown: Record<string, number>
}

// POST /api/ai/suggest-itinerary
export function useAISuggest() {
  return useMutation({
    mutationFn: (tripId: string) =>
      apiClient
        .post<{ suggestions: AISuggestion[] }>('/ai/suggest-itinerary', { tripId })
        .then((d) => d.suggestions),
  })
}

// POST /api/ai/estimate-budget
export function useAIBudgetEstimate() {
  return useMutation({
    mutationFn: (tripId: string) =>
      apiClient
        .post<{ estimate: AIBudgetEstimate | null }>('/ai/estimate-budget', { tripId })
        .then((d) => d.estimate),
  })
}
