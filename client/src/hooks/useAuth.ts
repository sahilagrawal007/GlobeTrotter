import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/apiClient'
import { useAuthStore } from '../store/authStore'
import type { User } from '@globetrotter/shared'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function useMe() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get<{ user: User }>('/auth/me').then((d) => d.user),
    enabled: !!token,
  })
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.post<{ user: User; token: string }>('/auth/login', data),
    onSuccess: (data) => setAuth(data.user, data.token),
  })
}

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      apiClient.post<{ user: User; token: string }>('/auth/signup', data),
    onSuccess: (data) => setAuth(data.user, data.token),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      apiClient.post<{ resetToken: string | null; _devNote?: string }>('/auth/forgot-password', data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { resetToken: string; newPassword: string }) =>
      apiClient.post<{ success: boolean }>('/auth/reset-password', data),
  })
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const qc = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)
  return useMutation({
    mutationFn: (data: { name?: string; avatarUrl?: string; language?: string }) =>
      apiClient.patch<{ user: User }>('/users/me', data).then((d) => d.user),
    onSuccess: (user) => {
      updateUser(user)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useDeleteAccount() {
  const logout = useAuthStore((s) => s.logout)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.delete<{ success: boolean }>('/users/me'),
    onSuccess: () => {
      logout()
      qc.clear()
    },
  })
}
