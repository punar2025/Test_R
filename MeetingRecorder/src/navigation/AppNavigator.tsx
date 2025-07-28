import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecordingScreen from '../screens/RecordingScreen';

import { RootStackParamList } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Notes') {
            iconName = 'library-books';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          } else {
            iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Record Meeting',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{
          title: 'Meeting Notes',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Recording" 
          component={RecordingScreen}
          options={{
            title: 'Recording Meeting',
            presentation: 'modal',
            headerLeft: () => null, // Prevent going back during recording
          }}
        />
        <Stack.Screen 
          name="NoteDetail" 
          component={NoteDetailScreen}
          options={{
            title: 'Meeting Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}