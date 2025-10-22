import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { RECORDING_OPTIONS } from '../utils/constants';
import { Platform } from 'react-native';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  currentRecording: Audio.Recording | null;
  recordingUri: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecordingState = {
  isRecording: false,
  isPaused: false,
  duration: 0,
  currentRecording: null,
  recordingUri: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const startRecording = createAsyncThunk(
  'recording/startRecording',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = Platform.OS === 'ios' 
        ? RECORDING_OPTIONS.ios 
        : RECORDING_OPTIONS.android;

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      
      return { recording };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start recording');
    }
  }
);

export const stopRecording = createAsyncThunk(
  'recording/stopRecording',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { recording: RecordingState };
      const recording = state.recording.currentRecording;
      
      if (!recording) {
        throw new Error('No active recording found');
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      return { 
        uri,
        size: fileInfo.exists ? fileInfo.size : 0,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to stop recording');
    }
  }
);

export const pauseRecording = createAsyncThunk(
  'recording/pauseRecording',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { recording: RecordingState };
      const recording = state.recording.currentRecording;
      
      if (!recording) {
        throw new Error('No active recording found');
      }

      await recording.pauseAsync();
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to pause recording');
    }
  }
);

export const resumeRecording = createAsyncThunk(
  'recording/resumeRecording',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { recording: RecordingState };
      const recording = state.recording.currentRecording;
      
      if (!recording) {
        throw new Error('No active recording found');
      }

      await recording.startAsync();
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to resume recording');
    }
  }
);

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    updateDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    resetRecording: (state) => {
      state.isRecording = false;
      state.isPaused = false;
      state.duration = 0;
      state.currentRecording = null;
      state.recordingUri = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start recording
      .addCase(startRecording.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startRecording.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRecording = true;
        state.isPaused = false;
        state.currentRecording = action.payload.recording;
        state.duration = 0;
      })
      .addCase(startRecording.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Stop recording
      .addCase(stopRecording.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(stopRecording.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRecording = false;
        state.isPaused = false;
        state.recordingUri = action.payload.uri;
        state.currentRecording = null;
      })
      .addCase(stopRecording.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Pause recording
      .addCase(pauseRecording.fulfilled, (state) => {
        state.isPaused = true;
      })
      .addCase(pauseRecording.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Resume recording
      .addCase(resumeRecording.fulfilled, (state) => {
        state.isPaused = false;
      })
      .addCase(resumeRecording.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { updateDuration, resetRecording, clearError } = recordingSlice.actions;
export default recordingSlice.reducer;