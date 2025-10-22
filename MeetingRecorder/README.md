# Meeting Recorder App

A comprehensive cross-platform mobile application built with React Native and Expo that allows users to record meetings, transcribe audio to text, translate content, and share meeting minutes via email.

## Features

### Core Functionality
- 🎙️ **Audio Recording**: High-quality meeting recording with pause/resume functionality
- 📝 **Speech-to-Text**: Automatic transcription using OpenAI Whisper API
- 🌐 **Translation**: Multi-language translation using Google Translate or DeepL APIs
- 📧 **Email Sharing**: Send meeting minutes via email with formatted content
- 📍 **Location Tagging**: GPS-based location tracking for meeting organization
- 💾 **Local & Cloud Storage**: Data persistence with optional cloud sync

### User Interface
- 🏠 **Home Screen**: Quick recording access and recent meetings overview
- 📚 **Notes Library**: Searchable meeting library with date and location filters
- 🔍 **Advanced Filtering**: Sort by date, title, duration, or location
- ⚙️ **Settings**: Configurable language preferences and API settings
- 🎨 **Modern UI**: Clean Material Design 3 interface with dark/light theme support

## Technology Stack

### Frontend
- **React Native** with TypeScript
- **Expo** for cross-platform development
- **React Navigation** for navigation
- **Redux Toolkit** for state management
- **React Native Paper** for UI components

### Backend Services
- **OpenAI Whisper API** for transcription
- **Google Translate API** / **DeepL API** for translation
- **Expo MailComposer** for email functionality
- **AsyncStorage** for local data persistence

### APIs and Permissions
- **expo-av** for audio recording
- **expo-location** for GPS services
- **expo-file-system** for file management
- **expo-sharing** for content sharing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### 1. Clone and Install Dependencies
```bash
# Navigate to the project directory
cd MeetingRecorder

# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli
```

### 2. API Configuration
The app requires API keys for full functionality:

#### OpenAI API (for transcription)
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Add it in the app's Settings screen

#### Google Translate API (optional)
1. Enable Google Cloud Translation API
2. Create credentials and get API key
3. Add it in the app's Settings screen

#### DeepL API (optional)
1. Sign up at [DeepL API](https://www.deepl.com/pro-api)
2. Get your authentication key
3. Add it in the app's Settings screen

### 3. Run the Application

#### Development Mode
```bash
# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

#### Production Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Project Structure

```
MeetingRecorder/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── NotesScreen.tsx
│   │   ├── NoteDetailScreen.tsx
│   │   ├── RecordingScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API and utility services
│   │   ├── transcriptionService.ts
│   │   ├── translationService.ts
│   │   ├── emailService.ts
│   │   ├── locationService.ts
│   │   └── storageService.ts
│   ├── store/              # Redux store and slices
│   │   ├── index.ts
│   │   ├── meetingsSlice.ts
│   │   ├── recordingSlice.ts
│   │   └── settingsSlice.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Constants and utilities
│       └── constants.ts
├── App.tsx                 # Main application component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## Key Features Implementation

### Recording Screen
- Real-time duration display
- Animated recording indicator
- Pause/resume functionality
- Location tagging
- Meeting title input

### Transcription Flow
- Integration with OpenAI Whisper API
- Support for multiple languages
- Mock transcription for testing
- Error handling and retry logic

### Translation Flow
- Multi-provider support (Google Translate, DeepL)
- Language selection dropdown
- Real-time translation
- Fallback mechanisms

### Email Sharing
- HTML-formatted meeting minutes
- Audio file attachments
- Fallback to system sharing
- Multiple recipient support

### Note Filtering
- Date range filtering (today, week, month)
- Location-based filtering
- Text search functionality
- Sorting options (date, title, duration)

## Configuration

### Environment Variables
For production deployment, consider using environment variables for API keys:

```javascript
// Example in constants.ts
export const API_ENDPOINTS = {
  TRANSCRIPTION: process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/audio/transcriptions',
  GOOGLE_TRANSLATE: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_URL || 'https://translation.googleapis.com/language/translate/v2',
  DEEPL_TRANSLATE: process.env.EXPO_PUBLIC_DEEPL_URL || 'https://api-free.deepl.com/v2/translate',
};
```

### Permissions
The app requires the following permissions:
- **Microphone**: For audio recording
- **Location**: For GPS tagging
- **Storage**: For saving audio files
- **Network**: For API calls

## Usage Guide

### Recording a Meeting
1. Tap "Start Recording" on the Home screen
2. Grant microphone and location permissions if prompted
3. Enter a meeting title (optional)
4. Use pause/resume controls as needed
5. Tap "Stop" to save the meeting

### Transcribing Audio
1. Navigate to a meeting in the Notes screen
2. Tap "Transcribe" in the meeting details
3. Wait for processing to complete
4. View the transcribed text

### Translating Content
1. Ensure the meeting is transcribed first
2. Select target language from dropdown
3. Tap "Translate" to process
4. View translation alongside original text

### Sharing Meeting Minutes
1. Enter recipient email address
2. Tap "Send Email" for direct email
3. Use "Share Text" for system sharing options
4. Use "Export File" for file-based sharing

## Troubleshooting

### Common Issues

**Audio Recording Fails**
- Check microphone permissions
- Ensure no other apps are using the microphone
- Try restarting the app

**Transcription Not Working**
- Verify OpenAI API key is valid
- Check internet connection
- Ensure audio file exists and is accessible

**Translation Fails**
- Verify API keys for translation services
- Check if source language is supported
- Ensure transcription exists before translating

**Email Sending Issues**
- Verify device has email capability
- Check email address format
- Try using "Share" as alternative

### Performance Tips
- Regular cleanup of old recordings
- Limit transcription to essential meetings
- Use appropriate audio quality settings
- Keep app updated

## Contributing

This is a demonstration project. For production use, consider:
- Implementing proper error boundaries
- Adding comprehensive testing
- Setting up CI/CD pipelines
- Adding analytics and crash reporting
- Implementing proper security measures for API keys

## License

This project is for educational and demonstration purposes. Please ensure compliance with API provider terms of service when using in production.

## Support

For issues with:
- **OpenAI API**: Check [OpenAI Documentation](https://platform.openai.com/docs)
- **Google Translate**: Review [Google Cloud Translation docs](https://cloud.google.com/translate/docs)
- **DeepL API**: See [DeepL API Documentation](https://www.deepl.com/docs-api)
- **Expo**: Visit [Expo Documentation](https://docs.expo.dev/)

---

**Meeting Recorder v1.0.0** - Built with ❤️ using React Native and Expo