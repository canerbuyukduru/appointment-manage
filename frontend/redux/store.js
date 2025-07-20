import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

// FEATURES
import authReducer from "./features/auth/authSlice";
import ownerReducer from "./features/ownerSlice";

// API
import { apiSlice } from "./api/apiSlice";


const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    owner: ownerReducer,
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
   
  devTools: true,
});

setupListeners(store.dispatch);
export default store;
