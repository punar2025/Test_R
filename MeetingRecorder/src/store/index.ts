import { configureStore } from '@reduxjs/toolkit';
import meetingsReducer from './meetingsSlice';
import settingsReducer from './settingsSlice';
import recordingReducer from './recordingSlice';

export const store = configureStore({
  reducer: {
    meetings: meetingsReducer,
    settings: settingsReducer,
    recording: recordingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;