import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Meeting, NotesFilter } from '../types';
import { storageService } from '../services/storageService';

interface MeetingsState {
  meetings: Meeting[];
  filteredMeetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  activeFilter: NotesFilter;
}

const initialState: MeetingsState = {
  meetings: [],
  filteredMeetings: [],
  isLoading: false,
  error: null,
  activeFilter: {},
};

// Async thunks
export const loadMeetings = createAsyncThunk(
  'meetings/loadMeetings',
  async () => {
    return await storageService.getMeetings();
  }
);

export const saveMeeting = createAsyncThunk(
  'meetings/saveMeeting',
  async (meeting: Meeting) => {
    await storageService.saveMeeting(meeting);
    return meeting;
  }
);

export const deleteMeeting = createAsyncThunk(
  'meetings/deleteMeeting',
  async (meetingId: string) => {
    await storageService.deleteMeeting(meetingId);
    return meetingId;
  }
);

export const updateMeeting = createAsyncThunk(
  'meetings/updateMeeting',
  async (meeting: Meeting) => {
    await storageService.updateMeeting(meeting);
    return meeting;
  }
);

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<NotesFilter>) => {
      state.activeFilter = action.payload;
      state.filteredMeetings = filterMeetings(state.meetings, action.payload);
    },
    clearFilter: (state) => {
      state.activeFilter = {};
      state.filteredMeetings = state.meetings;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load meetings
      .addCase(loadMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload;
        state.filteredMeetings = filterMeetings(action.payload, state.activeFilter);
      })
      .addCase(loadMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load meetings';
      })
      // Save meeting
      .addCase(saveMeeting.fulfilled, (state, action) => {
        state.meetings.push(action.payload);
        state.filteredMeetings = filterMeetings(state.meetings, state.activeFilter);
      })
      .addCase(saveMeeting.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save meeting';
      })
      // Delete meeting
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.meetings = state.meetings.filter(m => m.id !== action.payload);
        state.filteredMeetings = filterMeetings(state.meetings, state.activeFilter);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete meeting';
      })
      // Update meeting
      .addCase(updateMeeting.fulfilled, (state, action) => {
        const index = state.meetings.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
          state.filteredMeetings = filterMeetings(state.meetings, state.activeFilter);
        }
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update meeting';
      });
  },
});

// Helper function to filter meetings
function filterMeetings(meetings: Meeting[], filter: NotesFilter): Meeting[] {
  return meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    
    // Date filter
    if (filter.startDate && meetingDate < new Date(filter.startDate)) {
      return false;
    }
    if (filter.endDate && meetingDate > new Date(filter.endDate)) {
      return false;
    }
    
    // Location filter
    if (filter.location && meeting.location) {
      const locationMatch = 
        meeting.location.city?.toLowerCase().includes(filter.location.toLowerCase()) ||
        meeting.location.address?.toLowerCase().includes(filter.location.toLowerCase()) ||
        meeting.location.country?.toLowerCase().includes(filter.location.toLowerCase());
      if (!locationMatch) return false;
    }
    
    // Search text filter
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      const textMatch = 
        meeting.title.toLowerCase().includes(searchLower) ||
        meeting.transcription?.toLowerCase().includes(searchLower) ||
        meeting.translation?.toLowerCase().includes(searchLower);
      if (!textMatch) return false;
    }
    
    return true;
  });
}

export const { setFilter, clearFilter, clearError } = meetingsSlice.actions;
export default meetingsSlice.reducer;