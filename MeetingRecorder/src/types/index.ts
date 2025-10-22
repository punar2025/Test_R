export interface Meeting {
  id: string;
  title: string;
  audioUri: string;
  transcription?: string;
  translation?: string;
  originalLanguage: string;
  targetLanguage?: string;
  date: string;
  duration: number;
  location?: Location;
  isUploaded: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface AppSettings {
  defaultLanguage: string;
  defaultEmail: string;
  autoUpload: boolean;
  transcriptionProvider: 'openai' | 'whisper';
  translationProvider: 'deepl' | 'google';
}

export interface NotesFilter {
  startDate?: string;
  endDate?: string;
  location?: string;
  searchText?: string;
}

export interface AppState {
  meetings: Meeting[];
  isRecording: boolean;
  currentRecording?: {
    id: string;
    startTime: string;
    duration: number;
  };
  settings: AppSettings;
  isLoading: boolean;
  error?: string;
}

export interface TranscriptionResponse {
  text: string;
  language: string;
  confidence: number;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Notes: undefined;
  NoteDetail: { meetingId: string };
  Settings: undefined;
  Recording: undefined;
};

export type Language = {
  code: string;
  name: string;
  nativeName: string;
};