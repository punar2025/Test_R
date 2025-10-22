import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  TextInput,
  Button,
  Switch,
  List,
  Divider,
  Menu,
  Portal,
  Dialog,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import { saveSettings, updateSetting } from '../store/settingsSlice';
import { AppSettings } from '../types';
import { LANGUAGES } from '../utils/constants';
import { transcriptionService } from '../services/transcriptionService';
import { translationService } from '../services/translationService';
import { storageService } from '../services/storageService';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { settings, isLoading } = useSelector((state: RootState) => state.settings);

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [providerMenuVisible, setProviderMenuVisible] = useState(false);
  const [translationProviderMenuVisible, setTranslationProviderMenuVisible] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [deeplApiKey, setDeeplApiKey] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await dispatch(saveSettings(localSettings));
      
      // Update API keys in services
      if (openaiApiKey.trim()) {
        transcriptionService.setApiKey(openaiApiKey.trim());
      }
      if (googleApiKey.trim()) {
        translationService.setGoogleApiKey(googleApiKey.trim());
      }
      if (deeplApiKey.trim()) {
        translationService.setDeeplApiKey(deeplApiKey.trim());
      }

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleReset = async () => {
    try {
      await storageService.clearAllData();
      setLocalSettings({
        defaultLanguage: 'en',
        defaultEmail: '',
        autoUpload: false,
        transcriptionProvider: 'openai',
        translationProvider: 'google',
      });
      setOpenaiApiKey('');
      setGoogleApiKey('');
      setDeeplApiKey('');
      setResetDialogVisible(false);
      Alert.alert('Success', 'All data has been reset!');
    } catch (error) {
      console.error('Failed to reset data:', error);
      Alert.alert('Error', 'Failed to reset data. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await storageService.exportData();
      // In a real app, you'd save this to a file or share it
      Alert.alert(
        'Export Data',
        'Data export functionality would save your meetings and settings to a file.',
        [
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const updateLocalSetting = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const selectedLanguage = LANGUAGES.find(lang => lang.code === localSettings.defaultLanguage) || LANGUAGES[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Language Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Language Settings
            </Title>
            
            <List.Item
              title="Default Language"
              description="Language for new recordings and transcriptions"
              left={(props) => <List.Icon {...props} icon="language" />}
              right={() => (
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setLanguageMenuVisible(true)}
                      compact
                    >
                      {selectedLanguage.name}
                    </Button>
                  }
                >
                  {LANGUAGES.slice(0, 10).map((language) => (
                    <Menu.Item
                      key={language.code}
                      onPress={() => {
                        updateLocalSetting('defaultLanguage', language.code);
                        setLanguageMenuVisible(false);
                      }}
                      title={language.name}
                    />
                  ))}
                </Menu>
              )}
            />
          </Card.Content>
        </Card>

        {/* API Configuration */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              API Configuration
            </Title>
            
            <List.Item
              title="Transcription Provider"
              description="Choose your preferred transcription service"
              left={(props) => <List.Icon {...props} icon="text-to-speech" />}
              right={() => (
                <Menu
                  visible={providerMenuVisible}
                  onDismiss={() => setProviderMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setProviderMenuVisible(true)}
                      compact
                    >
                      {localSettings.transcriptionProvider === 'openai' ? 'OpenAI Whisper' : 'Whisper'}
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      updateLocalSetting('transcriptionProvider', 'openai');
                      setProviderMenuVisible(false);
                    }}
                    title="OpenAI Whisper"
                  />
                </Menu>
              )}
            />

            <TextInput
              label="OpenAI API Key"
              value={openaiApiKey}
              onChangeText={setOpenaiApiKey}
              mode="outlined"
              secureTextEntry
              placeholder="sk-..."
              style={styles.input}
              left={<TextInput.Icon icon="key" />}
            />

            <List.Item
              title="Translation Provider"
              description="Choose your preferred translation service"
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={() => (
                <Menu
                  visible={translationProviderMenuVisible}
                  onDismiss={() => setTranslationProviderMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setTranslationProviderMenuVisible(true)}
                      compact
                    >
                      {localSettings.translationProvider === 'google' ? 'Google Translate' : 'DeepL'}
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      updateLocalSetting('translationProvider', 'google');
                      setTranslationProviderMenuVisible(false);
                    }}
                    title="Google Translate"
                  />
                  <Menu.Item
                    onPress={() => {
                      updateLocalSetting('translationProvider', 'deepl');
                      setTranslationProviderMenuVisible(false);
                    }}
                    title="DeepL"
                  />
                </Menu>
              )}
            />

            <TextInput
              label="Google Translate API Key"
              value={googleApiKey}
              onChangeText={setGoogleApiKey}
              mode="outlined"
              secureTextEntry
              placeholder="Enter Google API key..."
              style={styles.input}
              left={<TextInput.Icon icon="key" />}
            />

            <TextInput
              label="DeepL API Key"
              value={deeplApiKey}
              onChangeText={setDeeplApiKey}
              mode="outlined"
              secureTextEntry
              placeholder="Enter DeepL API key..."
              style={styles.input}
              left={<TextInput.Icon icon="key" />}
            />
          </Card.Content>
        </Card>

        {/* Email Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Email Settings
            </Title>
            
            <TextInput
              label="Default Email"
              value={localSettings.defaultEmail}
              onChangeText={(text) => updateLocalSetting('defaultEmail', text)}
              mode="outlined"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />
          </Card.Content>
        </Card>

        {/* App Preferences */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              App Preferences
            </Title>
            
            <List.Item
              title="Auto Upload"
              description="Automatically sync meetings to cloud storage"
              left={(props) => <List.Icon {...props} icon="cloud-upload" />}
              right={() => (
                <Switch
                  value={localSettings.autoUpload}
                  onValueChange={(value) => updateLocalSetting('autoUpload', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Data Management
            </Title>
            
            <List.Item
              title="Export Data"
              description="Export all your meetings and settings"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={handleExportData}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Reset All Data"
              description="Clear all meetings, settings, and preferences"
              left={(props) => <List.Icon {...props} icon="delete-forever" />}
              titleStyle={{ color: theme.colors.error }}
              onPress={() => setResetDialogVisible(true)}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              About
            </Title>
            
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            
            <List.Item
              title="Developer"
              description="Meeting Recorder Team"
              left={(props) => <List.Icon {...props} icon="code-tags" />}
            />
            
            <List.Item
              title="Privacy Policy"
              description="View our privacy policy"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              onPress={() => Alert.alert('Privacy Policy', 'This app stores data locally on your device. No data is transmitted to our servers without your explicit consent.')}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Card style={[styles.saveCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
              icon="content-save"
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
            >
              Save Settings
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Reset Confirmation Dialog */}
      <Portal>
        <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Reset All Data?</Dialog.Title>
          <Dialog.Content>
            <Text>
              This will permanently delete all your meetings, transcriptions, translations, 
              and settings. This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleReset} textColor={theme.colors.error}>Reset</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  saveCard: {
    marginBottom: 32,
    elevation: 3,
  },
  saveButton: {
    marginVertical: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});

export default SettingsScreen;