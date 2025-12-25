import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import './globals.css';
import { FoodProvider} from '../Context/FoodContext';
//import { FoodProvider } from '../context/FoodContext';

export default function RootLayout() {

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe"); 
    }
  }, []);

  return (
    <FoodProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'transparentModal',
            animation: 'fade',
            headerShown: false 
          }} 
        />
      </Stack>
    </FoodProvider>
  );
}