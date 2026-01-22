import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
import '../app/globals.css';

import { FoodProvider } from '../Context/FoodContext';
import { AuthProvider, useAuth } from '../Context/AuthContext';
import { StatusBar } from 'expo-status-bar';

function InitialLayout() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe"); 
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'login';

    if (!userToken && !inAuthGroup) {
      router.replace('/login');
    } else if (userToken && inAuthGroup) {
      router.replace('/(tabs)/journal');
    }
  }, [userToken, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#120024] justify-center items-center">
        <ActivityIndicator size="large" color="#E0AAFF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="stats" options={{ headerShown: false }} />
      
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FoodProvider>
        <StatusBar style="light" />
        <InitialLayout />
      </FoodProvider>
    </AuthProvider>
  );
}