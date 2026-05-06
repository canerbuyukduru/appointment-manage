import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Token yenileme interceptor
api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await api.post('/auth/refresh-token')
        return api(original)
      } catch {
        window.location.href = '/giris'
      }
    }
    return Promise.reject(error.response?.data || error)
  }
)
