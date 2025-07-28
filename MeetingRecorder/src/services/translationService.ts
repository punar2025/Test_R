import axios from 'axios';
import { TranslationResponse } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

class TranslationService {
  private googleApiKey: string = '';
  private deeplApiKey: string = '';

  setGoogleApiKey(apiKey: string) {
    this.googleApiKey = apiKey;
  }

  setDeeplApiKey(apiKey: string) {
    this.deeplApiKey = apiKey;
  }

  async translateWithGoogle(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResponse> {
    if (!this.googleApiKey) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const params: any = {
        q: text,
        target: targetLanguage,
        key: this.googleApiKey,
        format: 'text',
      };

      if (sourceLanguage) {
        params.source = sourceLanguage;
      }

      const response = await axios.post(API_ENDPOINTS.GOOGLE_TRANSLATE, null, {
        params,
        timeout: 30000,
      });

      const translation = response.data.data.translations[0];
      
      return {
        translatedText: translation.translatedText,
        sourceLanguage: translation.detectedSourceLanguage || sourceLanguage || 'unknown',
        targetLanguage,
      };
    } catch (error) {
      console.error('Google Translation error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('Google Translate API access denied');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid translation request');
        }
      }
      
      throw new Error('Translation failed');
    }
  }

  async translateWithDeepL(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResponse> {
    if (!this.deeplApiKey) {
      throw new Error('DeepL API key not configured');
    }

    try {
      const params: any = {
        text,
        target_lang: targetLanguage.toUpperCase(),
        auth_key: this.deeplApiKey,
      };

      if (sourceLanguage) {
        params.source_lang = sourceLanguage.toUpperCase();
      }

      const response = await axios.post(API_ENDPOINTS.DEEPL_TRANSLATE, null, {
        params,
        timeout: 30000,
      });

      const translation = response.data.translations[0];
      
      return {
        translatedText: translation.text,
        sourceLanguage: translation.detected_source_language?.toLowerCase() || sourceLanguage || 'unknown',
        targetLanguage: targetLanguage.toLowerCase(),
      };
    } catch (error) {
      console.error('DeepL Translation error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('DeepL API access denied');
        } else if (error.response?.status === 456) {
          throw new Error('DeepL quota exceeded');
        }
      }
      
      throw new Error('Translation failed');
    }
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
    provider: 'google' | 'deepl' = 'google'
  ): Promise<TranslationResponse> {
    if (provider === 'deepl') {
      return this.translateWithDeepL(text, targetLanguage, sourceLanguage);
    } else {
      return this.translateWithGoogle(text, targetLanguage, sourceLanguage);
    }
  }

  // Mock translation for testing/demo purposes
  async mockTranslate(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockTranslations: Record<string, Record<string, string>> = {
      en: {
        es: "Esta es una traducción simulada del texto original.",
        fr: "Il s'agit d'une traduction simulée du texte original.",
        de: "Dies ist eine simulierte Übersetzung des ursprünglichen Textes.",
      },
      es: {
        en: "This is a simulated translation of the original text.",
        fr: "Il s'agit d'une traduction simulée du texte original.",
        de: "Dies ist eine simulierte Übersetzung des ursprünglichen Textes.",
      },
      fr: {
        en: "This is a simulated translation of the original text.",
        es: "Esta es una traducción simulada del texto original.",
        de: "Dies ist eine simulierte Übersetzung des ursprünglichen Textes.",
      },
    };

    const translatedText = mockTranslations[sourceLanguage]?.[targetLanguage] 
      || `[Translated to ${targetLanguage}] ${text}`;

    return {
      translatedText,
      sourceLanguage,
      targetLanguage,
    };
  }

  isLanguageSupported(language: string, provider: 'google' | 'deepl' = 'google'): boolean {
    const googleSupported = [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi',
      'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk',
      'sl', 'et', 'lv', 'lt', 'mt', 'cy', 'ga', 'eu', 'ca', 'gl', 'is', 'mk',
      'sq', 'az', 'be', 'ka', 'hy', 'ur', 'fa', 'he', 'yi', 'th', 'vi', 'id',
      'ms', 'tl', 'sw', 'zu', 'af', 'am', 'bn', 'gu', 'kn', 'ml', 'mr', 'ne',
      'or', 'pa', 'si', 'ta', 'te', 'ug', 'uz', 'ky', 'kk', 'mn', 'my', 'lo',
      'km', 'yo', 'ig', 'ha', 'so', 'rw', 'ny', 'sn', 'st', 'tn', 'ts', 'ss',
      've', 'xh', 'mi', 'sm', 'to', 'fj', 'mg', 'co', 'la', 'eo', 'jw', 'haw',
      'ceb', 'fy', 'gd', 'lb', 'mo', 'ps', 'su', 'tk', 'tr'
    ];

    const deeplSupported = [
      'en', 'de', 'fr', 'es', 'pt', 'it', 'ru', 'ja', 'zh', 'ko',
      'nl', 'pl', 'da', 'sv', 'no', 'fi', 'cs', 'hu', 'et', 'lv',
      'lt', 'sk', 'sl', 'bg', 'ro', 'el', 'tr', 'uk', 'ar', 'id'
    ];

    return provider === 'deepl' 
      ? deeplSupported.includes(language)
      : googleSupported.includes(language);
  }
}

export const translationService = new TranslationService();