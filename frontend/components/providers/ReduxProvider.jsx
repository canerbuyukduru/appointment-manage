// components/providers/ReduxProvider.jsx
'use client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store'

// Eski versiyondan kalma auth-storage key'ini temizle
if (typeof window !== 'undefined') {
  localStorage.removeItem('auth-storage')
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}