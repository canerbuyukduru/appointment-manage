// lib/store.js
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage kullanır
import { combineReducers } from '@reduxjs/toolkit'
import { authApi } from './services/authApi'
import authSlice from './features/authSlice'

// Persist ayarları
const persistConfig = {
  key: 'root',                    // localStorage key'i
  storage,                        // localStorage kullan
  whitelist: ['auth']             // Sadece auth slice'ını sakla
}

// Root reducer oluştur
const rootReducer = combineReducers({
  auth: authSlice,
  [authApi.reducerPath]: authApi.reducer,
})

// Persist ile sarılmış reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Store oluştur
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }).concat(authApi.middleware),
})

// Persistor oluştur (React'te kullanmak için)
export const persistor = persistStore(store)