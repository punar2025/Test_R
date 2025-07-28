import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as StoreProvider } from 'react-redux';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    primaryContainer: '#E3F2FD',
    secondary: '#FF6B35',
    secondaryContainer: '#FFF3E0',
    tertiary: '#4CAF50',
    tertiaryContainer: '#E8F5E8',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#F44336',
    errorContainer: '#FFEBEE',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#001D35',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#2E1500',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#002106',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    onError: '#FFFFFF',
    onErrorContainer: '#410E0B',
    onBackground: '#1C1B1F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#A8C8EC',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider store={store}>
        <PaperProvider theme={theme}>
          <StatusBar style="auto" />
          <AppNavigator />
        </PaperProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
