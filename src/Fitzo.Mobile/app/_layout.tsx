import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import './globals.css';

export default function RootLayout() {

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      
      NavigationBar.setBehaviorAsync("overlay-swipe"); 
    }
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}