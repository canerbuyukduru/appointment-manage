// lib/store.js
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage kullanır
import { combineReducers } from '@reduxjs/toolkit'
import { authApi } from './services/authApi'
import authSlice from './features/authSlice'
import { beautyCenterApi } from './services/beautyCenterApi'
import { departmentApi } from './services/departmentApi'
import { serviceApi } from './services/serviceApi'
import { appointmentApi } from './services/appointmentApi'

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
  [beautyCenterApi.reducerPath]: beautyCenterApi.reducer,
  [departmentApi.reducerPath]: departmentApi.reducer,
  [serviceApi.reducerPath]:serviceApi.reducer,
  [appointmentApi.reducerPath]: appointmentApi.reducer
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
    }).concat(authApi.middleware, beautyCenterApi.middleware, departmentApi.middleware, serviceApi.middleware, appointmentApi.middleware),
})

// Persistor oluştur (React'te kullanmak için)
export const persistor = persistStore(store)