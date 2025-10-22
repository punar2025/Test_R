import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meeting, AppSettings } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  async getMeetings(): Promise<Meeting[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEETINGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading meetings:', error);
      return [];
    }
  }

  async saveMeeting(meeting: Meeting): Promise<void> {
    try {
      const meetings = await this.getMeetings();
      const existingIndex = meetings.findIndex(m => m.id === meeting.id);
      
      if (existingIndex >= 0) {
        meetings[existingIndex] = meeting;
      } else {
        meetings.push(meeting);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch (error) {
      console.error('Error saving meeting:', error);
      throw error;
    }
  }

  async updateMeeting(meeting: Meeting): Promise<void> {
    try {
      const meetings = await this.getMeetings();
      const index = meetings.findIndex(m => m.id === meeting.id);
      
      if (index >= 0) {
        meetings[index] = meeting;
        await AsyncStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
      } else {
        throw new Error('Meeting not found');
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const meetings = await this.getMeetings();
      const filteredMeetings = meetings.filter(m => m.id !== meetingId);
      await AsyncStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(filteredMeetings));
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  async getMeeting(meetingId: string): Promise<Meeting | null> {
    try {
      const meetings = await this.getMeetings();
      return meetings.find(m => m.id === meetingId) || null;
    } catch (error) {
      console.error('Error getting meeting:', error);
      return null;
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.MEETINGS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.USER_PREFERENCES,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const meetings = await this.getMeetings();
      const settings = await this.getSettings();
      
      const exportData = {
        meetings,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.meetings && Array.isArray(data.meetings)) {
        await AsyncStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(data.meetings));
      }
      
      if (data.settings) {
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();