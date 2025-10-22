import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  StatusBar,
  BackHandler,
  Animated,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Text,
  useTheme,
  ActivityIndicator,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList, Meeting } from '../types';
import { RootState } from '../store';
import {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  updateDuration,
  resetRecording,
} from '../store/recordingSlice';
import { saveMeeting } from '../store/meetingsSlice';
import { locationService } from '../services/locationService';

type RecordingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Recording'>;

const RecordingScreen: React.FC = () => {
  const navigation = useNavigation<RecordingScreenNavigationProp>();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { isRecording, isPaused, duration, recordingUri, isLoading, error } = useSelector(
    (state: RootState) => state.recording
  );

  const [meetingTitle, setMeetingTitle] = useState('');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startRecordingSession();
    
    // Handle back button to prevent accidental exit during recording
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRecording) {
        handleStopRecording();
        return true;
      }
      return false;
    });

    return () => {
      backHandler.remove();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      startDurationTimer();
      startPulseAnimation();
    } else {
      stopDurationTimer();
      stopPulseAnimation();
    }
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const startRecordingSession = async () => {
    try {
      // Get current location
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);

      // Start recording
      await dispatch(startRecording());
      startTime.current = Date.now();
    } catch (error) {
      console.error('Failed to start recording session:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      navigation.goBack();
    }
  };

  const startDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    durationInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      dispatch(updateDuration(elapsed));
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePauseResume = async () => {
    if (isPaused) {
      dispatch(resumeRecording());
    } else {
      dispatch(pauseRecording());
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    Alert.alert(
      'Stop Recording',
      'Are you sure you want to stop recording? This will save your meeting.',
      [
        { text: 'Continue Recording', style: 'cancel' },
        { text: 'Stop & Save', onPress: stopAndSave },
      ]
    );
  };

  const stopAndSave = async () => {
    try {
      setIsSaving(true);
      
      // Stop recording
      const result = await dispatch(stopRecording());
      
      if (stopRecording.fulfilled.match(result)) {
        // Create meeting object
        const meeting: Meeting = {
          id: Date.now().toString(),
          title: meetingTitle.trim() || `Meeting ${new Date().toLocaleDateString()}`,
          audioUri: result.payload.uri,
          date: new Date().toISOString(),
          duration: duration,
          location: currentLocation,
          originalLanguage: 'en', // Default language
          isUploaded: false,
        };

        // Save meeting
        await dispatch(saveMeeting(meeting));
        
        // Reset recording state
        dispatch(resetRecording());
        
        // Navigate back with success message
        Alert.alert(
          'Recording Saved',
          'Your meeting has been saved successfully. You can now transcribe and translate it.',
          [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getRecordingStatusText = (): string => {
    if (isLoading) return 'Starting...';
    if (isPaused) return 'Paused';
    if (isRecording) return 'Recording';
    return 'Ready';
  };

  const getRecordingStatusColor = (): string => {
    if (isLoading) return theme.colors.onSurfaceVariant;
    if (isPaused) return theme.colors.warning || '#FF9800';
    if (isRecording) return theme.colors.error;
    return theme.colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.content}>
        {/* Recording Status */}
        <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statusContent}>
            <View style={styles.statusHeader}>
              <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                <MaterialIcons
                  name={isPaused ? 'pause' : 'fiber-manual-record'}
                  size={24}
                  color={getRecordingStatusColor()}
                />
              </Animated.View>
              <Text style={[styles.statusText, { color: getRecordingStatusColor() }]}>
                {getRecordingStatusText()}
              </Text>
            </View>
            
            <Title style={[styles.durationText, { color: theme.colors.onSurface }]}>
              {formatDuration(duration)}
            </Title>
          </Card.Content>
        </Card>

        {/* Meeting Info */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <TextInput
              label="Meeting Title"
              value={meetingTitle}
              onChangeText={setMeetingTitle}
              mode="outlined"
              style={styles.titleInput}
              placeholder="Enter meeting title..."
              disabled={isSaving}
            />
            
            {currentLocation && (
              <View style={styles.locationInfo}>
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]}>
                  {currentLocation.city || currentLocation.address || 'Location detected'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Recording Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controls}>
            {/* Pause/Resume Button */}
            <IconButton
              icon={isPaused ? 'play' : 'pause'}
              size={32}
              mode="contained-tonal"
              onPress={handlePauseResume}
              disabled={!isRecording || isLoading || isSaving}
              style={[styles.controlButton, { backgroundColor: theme.colors.secondaryContainer }]}
              iconColor={theme.colors.onSecondaryContainer}
            />

            {/* Stop Button */}
            <IconButton
              icon="stop"
              size={40}
              mode="contained"
              onPress={handleStopRecording}
              disabled={!isRecording || isLoading || isSaving}
              style={[styles.stopButton, { backgroundColor: theme.colors.error }]}
              iconColor={theme.colors.onError}
            />
          </View>

          {isSaving && (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.savingText, { color: theme.colors.onSurfaceVariant }]}>
                Saving recording...
              </Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <Card style={[styles.instructionsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content style={styles.instructionsContent}>
            <MaterialIcons
              name="info"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.instructionsText, { color: theme.colors.onSurfaceVariant }]}>
              Tap pause to temporarily stop recording, or stop to finish and save your meeting.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  statusCard: {
    marginBottom: 30,
    elevation: 4,
  },
  statusContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingIndicator: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  durationText: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  infoCard: {
    marginBottom: 40,
    elevation: 2,
  },
  titleInput: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  controlButton: {
    elevation: 3,
  },
  stopButton: {
    elevation: 6,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  savingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  instructionsCard: {
    elevation: 1,
  },
  instructionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  instructionsText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

export default RecordingScreen;