import { configureStore } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import booksReducer from './slices/booksSlice';
import resourcesReducer from './slices/resourcesSlice';
import { resetStateMiddleware } from './slices/resetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    resources: resourcesReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(resetStateMiddleware as Middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
