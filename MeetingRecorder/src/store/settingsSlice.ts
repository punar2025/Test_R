import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
};

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async () => {
    const settings = await storageService.getSettings();
    return settings || DEFAULT_SETTINGS;
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: Partial<AppSettings>) => {
    const updatedSettings = { ...DEFAULT_SETTINGS, ...settings };
    await storageService.saveSettings(updatedSettings);
    return updatedSettings;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = DEFAULT_SETTINGS;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load settings';
      })
      // Save settings
      .addCase(saveSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save settings';
      });
  },
});

export const { updateSetting, resetSettings, clearError } = settingsSlice.actions;
export default settingsSlice.reducer;