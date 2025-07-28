import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
  Menu,
  IconButton,
  TextInput,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList, Meeting, Language } from '../types';
import { RootState } from '../store';
import { updateMeeting } from '../store/meetingsSlice';
import { transcriptionService } from '../services/transcriptionService';
import { translationService } from '../services/translationService';
import { emailService } from '../services/emailService';
import { LANGUAGES } from '../utils/constants';

type NoteDetailRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;
type NoteDetailNavigationProp = StackNavigationProp<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen: React.FC = () => {
  const route = useRoute<NoteDetailRouteProp>();
  const navigation = useNavigation<NoteDetailNavigationProp>();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { meetingId } = route.params;
  const meetings = useSelector((state: RootState) => state.meetings.meetings);
  const meeting = meetings.find(m => m.id === meetingId);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);

  useEffect(() => {
    if (!meeting) {
      Alert.alert('Error', 'Meeting not found');
      navigation.goBack();
    }
  }, [meeting, navigation]);

  if (!meeting) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading meeting...
          </Text>
        </View>
      </View>
    );
  }

  const handleTranscribe = async () => {
    if (!meeting.audioUri) {
      Alert.alert('Error', 'No audio file found for this meeting');
      return;
    }

    setIsTranscribing(true);
    try {
      // Use mock transcription for demo purposes
      const result = await transcriptionService.mockTranscribe(
        meeting.audioUri,
        meeting.originalLanguage
      );

      const updatedMeeting: Meeting = {
        ...meeting,
        transcription: result.text,
        originalLanguage: result.language,
      };

      await dispatch(updateMeeting(updatedMeeting));
      Alert.alert('Success', 'Meeting transcribed successfully!');
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe meeting. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranslate = async () => {
    if (!meeting.transcription) {
      Alert.alert('Error', 'Please transcribe the meeting first');
      return;
    }

    setIsTranslating(true);
    try {
      // Use mock translation for demo purposes
      const result = await translationService.mockTranslate(
        meeting.transcription,
        selectedLanguage.code,
        meeting.originalLanguage
      );

      const updatedMeeting: Meeting = {
        ...meeting,
        translation: result.translatedText,
        targetLanguage: selectedLanguage.code,
      };

      await dispatch(updateMeeting(updatedMeeting));
      Alert.alert('Success', `Meeting translated to ${selectedLanguage.name}!`);
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Error', 'Failed to translate meeting. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      const success = await emailService.sendMeetingMinutes(
        meeting,
        [emailInput.trim()]
      );

      if (success) {
        Alert.alert('Success', 'Meeting minutes sent successfully!');
        setEmailInput('');
      } else {
        // Fallback to sharing if email fails
        const success = await emailService.shareMeetingMinutes(meeting);
        if (success) {
          Alert.alert(
            'Shared',
            'Meeting minutes have been shared. Email might not be available on this device.'
          );
        } else {
          throw new Error('Failed to share meeting minutes');
        }
      }
    } catch (error) {
      console.error('Email error:', error);
      Alert.alert('Error', 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = `Meeting: ${meeting.title}\nDate: ${new Date(meeting.date).toLocaleString()}\n\n${
        meeting.transcription ? `Transcription:\n${meeting.transcription}\n\n` : ''
      }${
        meeting.translation ? `Translation:\n${meeting.translation}` : ''
      }`;

      await Share.share({
        message: shareContent,
        title: `Meeting Minutes - ${meeting.title}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (durationMs: number) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Meeting Info */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.meetingTitle, { color: theme.colors.onSurface }]}>
              {meeting.title}
            </Title>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDate(meeting.date)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="timer" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDuration(meeting.duration)}
                </Text>
              </View>
            </View>

            {meeting.location && (
              <View style={styles.metaItem}>
                <MaterialIcons name="location-on" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                  {meeting.location.address || meeting.location.city || 'Unknown location'}
                </Text>
              </View>
            )}

            <View style={styles.statusChips}>
              {meeting.transcription && (
                <Chip compact mode="flat" icon="text-to-speech">
                  Transcribed
                </Chip>
              )}
              {meeting.translation && (
                <Chip compact mode="flat" icon="translate">
                  Translated ({meeting.targetLanguage?.toUpperCase()})
                </Chip>
              )}
              {meeting.isUploaded && (
                <Chip compact mode="flat" icon="cloud-check">
                  Synced
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Transcription Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Transcription
              </Title>
              <Button
                mode={meeting.transcription ? 'outlined' : 'contained'}
                onPress={handleTranscribe}
                loading={isTranscribing}
                disabled={isTranscribing}
                compact
                icon="text-to-speech"
              >
                {meeting.transcription ? 'Re-transcribe' : 'Transcribe'}
              </Button>
            </View>

            {meeting.transcription ? (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <Text style={[styles.contentText, { color: theme.colors.onSurface }]}>
                    {meeting.transcription}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.emptyContent}>
                <MaterialIcons
                  name="text-to-speech"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No transcription available. Tap the button above to transcribe this meeting.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Translation Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Translation
              </Title>
              <View style={styles.translationControls}>
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setLanguageMenuVisible(true)}
                      compact
                      icon="language"
                    >
                      {selectedLanguage.name}
                    </Button>
                  }
                >
                  {LANGUAGES.slice(0, 10).map((language) => (
                    <Menu.Item
                      key={language.code}
                      onPress={() => {
                        setSelectedLanguage(language);
                        setLanguageMenuVisible(false);
                      }}
                      title={language.name}
                    />
                  ))}
                </Menu>
                <Button
                  mode={meeting.translation ? 'outlined' : 'contained'}
                  onPress={handleTranslate}
                  loading={isTranslating}
                  disabled={isTranslating || !meeting.transcription}
                  compact
                  icon="translate"
                  style={styles.translateButton}
                >
                  {meeting.translation ? 'Re-translate' : 'Translate'}
                </Button>
              </View>
            </View>

            {meeting.translation ? (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <Text style={[styles.contentText, { color: theme.colors.onSurface }]}>
                    {meeting.translation}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.emptyContent}>
                <MaterialIcons
                  name="translate"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  {meeting.transcription
                    ? 'Select a language and tap translate to get a translation.'
                    : 'Please transcribe the meeting first before translating.'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Share Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Share Meeting
            </Title>

            <View style={styles.emailSection}>
              <TextInput
                label="Email Address"
                value={emailInput}
                onChangeText={setEmailInput}
                mode="outlined"
                placeholder="Enter email address..."
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.emailInput}
                disabled={isSending}
              />
              <Button
                mode="contained"
                onPress={handleSendEmail}
                loading={isSending}
                disabled={isSending || !emailInput.trim()}
                icon="email"
                style={styles.sendButton}
              >
                Send Email
              </Button>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.shareActions}>
              <Button
                mode="outlined"
                onPress={handleShare}
                icon="share"
                style={styles.shareButton}
              >
                Share Text
              </Button>
              <Button
                mode="outlined"
                onPress={() => emailService.shareMeetingMinutes(meeting)}
                icon="file-document"
                style={styles.shareButton}
              >
                Export File
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  meetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  translationControls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  translateButton: {
    marginLeft: 8,
  },
  contentCard: {
    backgroundColor: '#F5F5F5',
    elevation: 1,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailSection: {
    marginBottom: 16,
  },
  emailInput: {
    marginBottom: 12,
  },
  sendButton: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
  },
});

export default NoteDetailScreen;