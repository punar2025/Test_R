import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList, Meeting } from '../types';
import { RootState } from '../store';
import { loadMeetings } from '../store/meetingsSlice';
import { loadSettings } from '../store/settingsSlice';
import { locationService } from '../services/locationService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { meetings, isLoading } = useSelector((state: RootState) => state.meetings);
  const { settings } = useSelector((state: RootState) => state.settings);

  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Load initial data
    dispatch(loadMeetings());
    dispatch(loadSettings());
    checkLocationPermission();
  }, [dispatch]);

  const checkLocationPermission = async () => {
    const hasPermission = await locationService.requestPermissions();
    setLocationPermission(hasPermission);
  };

  const handleStartRecording = async () => {
    try {
      // Check location permission if not already checked
      if (locationPermission === null) {
        const hasPermission = await locationService.requestPermissions();
        setLocationPermission(hasPermission);
        
        if (!hasPermission) {
          Alert.alert(
            'Location Permission',
            'Location access is recommended for better meeting organization. You can still record without it.',
            [
              { text: 'Continue', onPress: () => navigation.navigate('Recording') },
              { text: 'Grant Permission', onPress: checkLocationPermission },
            ]
          );
          return;
        }
      }

      navigation.navigate('Recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const recentMeetings = meetings.slice(0, 3); // Show last 3 meetings

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={[styles.title, { color: theme.colors.onBackground }]}>
            Meeting Recorder
          </Title>
          <Paragraph style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Record, transcribe, and translate your meetings
          </Paragraph>
        </View>

        {/* Main Recording Button */}
        <Card style={[styles.recordingCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.recordingCardContent}>
            <MaterialIcons 
              name="mic" 
              size={48} 
              color={theme.colors.primary} 
              style={styles.micIcon}
            />
            <Title style={[styles.recordingTitle, { color: theme.colors.onSurface }]}>
              Start New Meeting
            </Title>
            <Paragraph style={[styles.recordingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Tap to begin recording your meeting
            </Paragraph>
            <Button
              mode="contained"
              onPress={handleStartRecording}
              style={styles.recordButton}
              contentStyle={styles.recordButtonContent}
              labelStyle={styles.recordButtonLabel}
              icon="record"
            >
              Start Recording
            </Button>
          </Card.Content>
        </Card>

        {/* Location Permission Notice */}
        {locationPermission === false && (
          <Card style={[styles.noticeCard, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content style={styles.noticeContent}>
              <MaterialIcons 
                name="location-off" 
                size={24} 
                color={theme.colors.onErrorContainer} 
              />
              <View style={styles.noticeText}>
                <Text style={[styles.noticeTitle, { color: theme.colors.onErrorContainer }]}>
                  Location Access Disabled
                </Text>
                <Text style={[styles.noticeSubtitle, { color: theme.colors.onErrorContainer }]}>
                  Enable location to tag meetings by location
                </Text>
              </View>
              <Button
                mode="text"
                onPress={checkLocationPermission}
                textColor={theme.colors.onErrorContainer}
                compact
              >
                Enable
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Recent Meetings */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Title style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Recent Meetings
            </Title>
            {meetings.length > 3 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('Notes')}
                compact
              >
                View All
              </Button>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                Loading meetings...
              </Text>
            </View>
          ) : recentMeetings.length > 0 ? (
            recentMeetings.map((meeting) => (
              <Card 
                key={meeting.id} 
                style={[styles.meetingCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('NoteDetail', { meetingId: meeting.id })}
              >
                <Card.Content style={styles.meetingCardContent}>
                  <View style={styles.meetingHeader}>
                    <View style={styles.meetingInfo}>
                      <Text style={[styles.meetingTitle, { color: theme.colors.onSurface }]}>
                        {meeting.title}
                      </Text>
                      <Text style={[styles.meetingDate, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(meeting.date)} • {formatDuration(meeting.duration)}
                      </Text>
                    </View>
                    <View style={styles.meetingChips}>
                      {meeting.transcription && (
                        <Chip 
                          compact 
                          mode="outlined"
                          style={styles.chip}
                          textStyle={styles.chipText}
                        >
                          Transcribed
                        </Chip>
                      )}
                      {meeting.translation && (
                        <Chip 
                          compact 
                          mode="outlined"
                          style={styles.chip}
                          textStyle={styles.chipText}
                        >
                          Translated
                        </Chip>
                      )}
                    </View>
                  </View>
                  {meeting.location && (
                    <View style={styles.locationInfo}>
                      <MaterialIcons 
                        name="location-on" 
                        size={16} 
                        color={theme.colors.onSurfaceVariant} 
                      />
                      <Text style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]}>
                        {meeting.location.city || meeting.location.address || 'Unknown location'}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons 
                  name="mic-none" 
                  size={48} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  No meetings yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Start recording your first meeting to see it here
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
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
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  recordingCard: {
    marginBottom: 20,
    elevation: 4,
  },
  recordingCardContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  micIcon: {
    marginBottom: 16,
  },
  recordingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recordingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  recordButton: {
    minWidth: 160,
  },
  recordButtonContent: {
    paddingVertical: 8,
  },
  recordButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  noticeCard: {
    marginBottom: 20,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  noticeText: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  noticeSubtitle: {
    fontSize: 12,
  },
  recentSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  meetingCard: {
    marginBottom: 12,
    elevation: 2,
  },
  meetingCardContent: {
    paddingVertical: 16,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 12,
  },
  meetingChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;