// lib/store.js - Comment API ile güncellenmiş versiyon
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// API imports
import { authApi } from './services/authApi'
import { adminApi } from './services/adminApi'
import { beautyCenterApi } from './services/beautyCenterApi'
import { departmentApi } from './services/departmentApi'
import { serviceApi } from './services/serviceApi'
import { appointmentApi } from './services/appointmentApi'
import { commentApi } from './services/commentApi' // 🆕 Comment API eklendi

// Slice imports
import authSlice from './features/authSlice'

// Persist ayarları
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Sadece auth slice'ını sakla
}

// Root reducer oluştur
const rootReducer = combineReducers({
  auth: authSlice,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [beautyCenterApi.reducerPath]: beautyCenterApi.reducer,
  [departmentApi.reducerPath]: departmentApi.reducer,
  [serviceApi.reducerPath]: serviceApi.reducer,
  [appointmentApi.reducerPath]: appointmentApi.reducer,
  [commentApi.reducerPath]: commentApi.reducer, // 🆕 Comment API reducer
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
    }).concat(
      authApi.middleware,
      adminApi.middleware,
      beautyCenterApi.middleware,
      departmentApi.middleware,
      serviceApi.middleware,
      appointmentApi.middleware,
      commentApi.middleware, // 🆕 Comment API middleware
    ),
})

// 🔥 Persistor'ı export et
export const persistor = persistStore(store)