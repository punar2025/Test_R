# 📱 Meeting Recorder App - Visual Guide

## App Theme & Design
- **Design System**: Material Design 3
- **Primary Color**: iOS Blue (#007AFF)
- **Typography**: Clean, modern fonts with proper hierarchy
- **Layout**: Card-based design with consistent spacing
- **Navigation**: Bottom tab bar with stack navigation

---

## 🏠 Home Screen
```
┌─────────────────────────────────────┐
│  📱 Meeting Recorder                │ ← Header
├─────────────────────────────────────┤
│                                     │
│       🎙️ Meeting Recorder           │ ← App Title
│   Record, transcribe, and translate │ ← Subtitle
│         your meetings               │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │            🎤                   │ │ ← Recording Card
│  │      Start New Meeting          │ │
│  │  Tap to begin recording your    │ │
│  │         meeting                 │ │
│  │                                 │ │
│  │    [📹 Start Recording]         │ │ ← Primary CTA Button
│  └─────────────────────────────────┘ │
│                                     │
│  📍 Location: San Francisco, CA     │ ← Location notice (if granted)
│                                     │
│  Recent Meetings                    │ ← Section header
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Weekly Team Standup        🗑️   │ │ ← Meeting cards
│  │ Dec 15, 2:30 PM • 45:30        │ │
│  │ [Transcribed] [Translated]      │ │ ← Status chips
│  │ 📍 Office Building              │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Client Project Review      🗑️   │ │
│  │ Dec 14, 10:00 AM • 1:23:15     │ │
│  │ [Transcribed]                   │ │
│  │ 📍 Conference Room A            │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
│ 🏠 Home  📚 Notes  ⚙️ Settings    │ ← Bottom tabs
└─────────────────────────────────────┘
```

**Key Features:**
- Large, prominent recording button
- Recent meetings with status indicators
- Location permission handling
- Material Design cards with elevation

---

## 🎤 Recording Screen (Modal)
```
┌─────────────────────────────────────┐
│  ← Recording Meeting                │ ← Modal header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐ │
│  │         🔴 RECORDING            │ │ ← Status card (animated)
│  │                                 │ │
│  │         00:05:32                │ │ ← Live duration timer
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Meeting Title                   │ │ ← Input card
│  │ ┌─────────────────────────────┐ │ │
│  │ │ Weekly team standup...      │ │ │ ← Text input
│  │ └─────────────────────────────┘ │ │
│  │                                 │ │
│  │ 📍 San Francisco, CA            │ │ ← Location display
│  └─────────────────────────────────┘ │
│                                     │
│         ⏸️        ⏹️                │ ← Control buttons
│       Pause      Stop               │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ℹ️ Tap pause to temporarily     │ │ ← Instructions
│  │   stop recording, or stop to    │ │
│  │   finish and save your meeting. │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Key Features:**
- Real-time animated recording indicator
- Live duration counter
- Pause/resume functionality
- Meeting title input
- Location detection
- Clear instructions

---

## 📚 Notes Screen
```
┌─────────────────────────────────────┐
│  Meeting Notes                      │ ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search meetings...           │ │ ← Search bar
│ └─────────────────────────────────┘ │
│                                     │
│ [Date Filter] [📍Location] [📅] 🔽  │ ← Filter chips & sort
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Weekly Team Standup        🗑️   │ │ ← Meeting cards
│ │ Dec 15, 2024, 2:30 PM • 45:30  │ │
│ │ [Transcribed] [Translated] [☁️] │ │ ← Status chips
│ │ 📍 Office Building              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Client Project Review      🗑️   │ │
│ │ Dec 14, 2024, 10:00 AM • 1:23  │ │
│ │ [Transcribed]                   │ │
│ │ 📍 Conference Room A            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Daily Scrum Meeting        🗑️   │ │
│ │ Dec 13, 2024, 9:00 AM • 15:45  │ │
│ │ [Transcribed] [Translated]      │ │
│ │ 📍 Remote                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
│ 🏠 Home  📚 Notes  ⚙️ Settings    │
└─────────────────────────────────────┘
```

**Key Features:**
- Search functionality
- Active filter chips
- Sortable meeting list
- Status indicators (transcribed, translated, synced)
- Delete actions with confirmation

---

## 📋 Note Detail Screen
```
┌─────────────────────────────────────┐
│  ← Meeting Details                  │ ← Back navigation
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Weekly Team Standup             │ │ ← Meeting info card
│ │                                 │ │
│ │ ⏰ Friday, Dec 15, 2024, 2:30 PM │ │
│ │ ⏱️ 45 minutes 30 seconds        │ │
│ │ 📍 Office Building, SF          │ │
│ │                                 │ │
│ │ [Transcribed] [Translated (ES)] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Transcription    [Re-transcribe]│ │ ← Transcription section
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Good morning everyone. Let's │ │ │ ← Content card
│ │ │ start with our weekly standup│ │ │
│ │ │ meeting. Sarah, would you   │ │ │
│ │ │ like to go first with your  │ │ │
│ │ │ updates from this week?     │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Translation [English ▼][Translate]│ │ ← Translation section
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Buenos días a todos. Vamos  │ │ │ ← Translated content
│ │ │ a comenzar con nuestra      │ │ │
│ │ │ reunión semanal de estado...│ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Share Meeting                   │ │ ← Sharing section
│ │                                 │ │
│ │ Email: [user@company.com......] │ │
│ │        [📧 Send Email]          │ │
│ │                                 │ │
│ │ ──────────────────────────────  │ │
│ │                                 │ │
│ │ [📤 Share Text] [📄 Export File]│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Key Features:**
- Complete meeting metadata
- Transcription with re-transcribe option
- Language selection for translation
- Email sharing with validation
- Export and share options

---

## ⚙️ Settings Screen
```
┌─────────────────────────────────────┐
│  Settings                           │ ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Language Settings               │ │ ← Language section
│ │                                 │ │
│ │ 🌐 Default Language             │ │
│ │    Language for recordings      │ │
│ │                    [English ▼] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ API Configuration               │ │ ← API section
│ │                                 │ │
│ │ 🎤 Transcription Provider       │ │
│ │    Choose transcription service │ │
│ │                [OpenAI Whisper]│ │
│ │                                 │ │
│ │ 🔑 OpenAI API Key               │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ sk-...                      │ │ │ ← Secure input
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ 🌐 Translation Provider         │ │
│ │    Choose translation service   │ │
│ │                [Google Translate]│ │
│ │                                 │ │
│ │ 🔑 Google Translate API Key     │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Enter Google API key...     │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Email Settings                  │ │ ← Email section
│ │                                 │ │
│ │ 📧 Default Email                │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ your@email.com              │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ App Preferences                 │ │ ← Preferences section
│ │                                 │ │
│ │ ☁️ Auto Upload                  │ │
│ │    Sync meetings to cloud       │ │
│ │                            [⭕] │ │ ← Toggle switch
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │       [💾 Save Settings]        │ │ ← Save button
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
│ 🏠 Home  📚 Notes  ⚙️ Settings    │
└─────────────────────────────────────┘
```

**Key Features:**
- Language selection dropdown
- API provider configuration
- Secure API key inputs
- Email preferences
- Auto-upload toggle
- Prominent save button

---

## 🎨 Design Elements

### Color Scheme
- **Primary**: iOS Blue (#007AFF)
- **Surface**: Clean white cards
- **Background**: Light gray (#FAFAFA)
- **Text**: High contrast dark gray
- **Accent**: Orange for secondary actions
- **Success**: Green for completed states
- **Error**: Red for warnings/deletions

### Typography
- **Titles**: Bold, 24px
- **Headings**: Semi-bold, 18px
- **Body**: Regular, 16px
- **Captions**: Regular, 14px
- **Labels**: Medium, 12px

### Icons
- Material Design icons throughout
- Contextual icons for each feature
- Status indicators with color coding
- Navigation icons in tab bar

### Interactions
- Card press animations
- Button press feedback
- Loading states with spinners
- Smooth transitions between screens
- Pull-to-refresh on lists
- Swipe gestures for actions

---

## 📱 Responsive Design

The app adapts to different screen sizes:
- **Phone**: Optimized for single-hand use
- **Tablet**: Wider cards with better spacing
- **Landscape**: Adjusted layouts for horizontal orientation

## ♿ Accessibility

- High contrast text
- Touch targets 44px minimum
- Screen reader support
- Keyboard navigation support
- Clear visual hierarchy
- Descriptive button labels

This visual guide shows how the app provides a clean, intuitive, and professional interface for meeting recording and management!