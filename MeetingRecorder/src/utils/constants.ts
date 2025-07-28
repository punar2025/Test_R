import { Language } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const API_ENDPOINTS = {
  TRANSCRIPTION: 'https://api.openai.com/v1/audio/transcriptions',
  DEEPL_TRANSLATE: 'https://api-free.deepl.com/v2/translate',
  GOOGLE_TRANSLATE: 'https://translation.googleapis.com/language/translate/v2',
};

export const STORAGE_KEYS = {
  MEETINGS: 'meetings',
  SETTINGS: 'settings',
  USER_PREFERENCES: 'userPreferences',
};

export const DEFAULT_SETTINGS = {
  defaultLanguage: 'en',
  defaultEmail: '',
  autoUpload: false,
  transcriptionProvider: 'openai' as const,
  translationProvider: 'google' as const,
};

export const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};