'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import type { LoginFormData, RegisterFormData } from '@/lib/validations/auth'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'business_owner' | 'staff' | 'customer'
  avatar?: string
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
  }
}

interface MeResponse {
  success: boolean
  data: {
    user: User
  }
}

export function useLogin() {
  const router = useRouter()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginFormData) =>
      api.post<never, AuthResponse>('/auth/login', data),
    onSuccess: (response) => {
      setUser(response.data.user)
      router.push('/')
    },
  })
}

export function useRegister() {
  const router = useRouter()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      api.post<never, AuthResponse>('/auth/register', data),
    onSuccess: (response) => {
      setUser(response.data.user)
      router.push('/')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      logout()
      router.push('/giris')
    },
    onError: () => {
      // Hata olsa bile store temizlenir
      logout()
      router.push('/giris')
    },
  })
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore()

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<never, MeResponse>('/auth/me'),
    enabled: isAuthenticated,
    select: (response: MeResponse) => response.data.user,
  })

  // TanStack Query v5'te onSuccess kaldırıldı — useEffect ile senkronize et
  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  return query
}
