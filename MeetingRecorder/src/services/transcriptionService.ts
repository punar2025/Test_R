import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { TranscriptionResponse } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

class TranscriptionService {
  private apiKey: string = '';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioUri: string, language?: string): Promise<TranscriptionResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Read the audio file
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      
      formData.append('model', 'whisper-1');
      
      if (language) {
        formData.append('language', language);
      }

      const response = await axios.post(API_ENDPOINTS.TRANSCRIPTION, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout
      });

      return {
        text: response.data.text,
        language: response.data.language || language || 'unknown',
        confidence: 1.0, // Whisper doesn't provide confidence scores
      };
    } catch (error) {
      console.error('Transcription error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key');
        } else if (error.response?.status === 413) {
          throw new Error('Audio file too large');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - please try again');
        }
      }
      
      throw new Error('Failed to transcribe audio');
    }
  }

  async transcribeWithRetry(audioUri: string, language?: string, maxRetries: number = 3): Promise<TranscriptionResponse> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.transcribeAudio(audioUri, language);
      } catch (error) {
        lastError = error as Error;
        console.log(`Transcription attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError!;
  }

  // Mock transcription for testing/demo purposes
  async mockTranscribe(audioUri: string, language: string = 'en'): Promise<TranscriptionResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTranscriptions = {
      en: "This is a mock transcription of the meeting. The participants discussed project requirements, timelines, and next steps. Key decisions were made regarding the implementation approach.",
      es: "Esta es una transcripción simulada de la reunión. Los participantes discutieron los requisitos del proyecto, cronogramas y próximos pasos.",
      fr: "Il s'agit d'une transcription simulée de la réunion. Les participants ont discuté des exigences du projet, des échéanciers et des prochaines étapes.",
    };

    return {
      text: mockTranscriptions[language as keyof typeof mockTranscriptions] || mockTranscriptions.en,
      language,
      confidence: 0.95,
    };
  }
}

export const transcriptionService = new TranscriptionService();