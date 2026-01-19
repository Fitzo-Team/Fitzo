import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../Context/AuthContext';
import { useFood } from '../../Context/FoodContext';

const MenuRow = ({ icon, title, subtitle, isDestructive = false, onPress, rightElement }: any) => (
  <TouchableOpacity 
    className="flex-row items-center p-4 py-5 bg-brand-dark border-b border-brand-card active:bg-brand-card"
    onPress={onPress}
  >
    <View className="w-8 items-center">{icon}</View>
    <View className="flex-1 ml-3">
      <Text className={`text-base font-medium ${isDestructive ? 'text-red-500' : 'text-brand-text'}`}>{title}</Text>
      {subtitle && <Text className="text-brand-muted text-xs">{subtitle}</Text>}
    </View>
    {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color="#666" />}
  </TouchableOpacity>
);

export default function MoreScreen() {
  const router = useRouter();
  const { logout, userData, userToken } = useAuth();
  const { exportData, importData } = useFood();

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 mb-2">
        <Text className="text-brand-text text-3xl font-bold mb-6">Więcej</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
            className="flex-row items-center mx-5 p-4 bg-brand-card rounded-2xl border border-brand-accent mb-6 shadow-md"
            onPress={() => router.push('/settings')} // Profil jest teraz częścią ustawień/konta
        >
            <View className="w-14 h-14 bg-brand-vivid rounded-full items-center justify-center border border-brand-light">
                {userToken && userData?.email ? (
                   <Text className="text-white text-xl font-bold">
                     {userData.email.charAt(0).toUpperCase()}
                   </Text>
                ) : (
                   <Ionicons name="person" size={24} color="white" />
                )}
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-brand-text font-bold text-lg">
                    {userToken ? (userData?.username || userData?.email || 'Użytkownik') : 'Profil Gościa'}
                </Text>
                <Text className="text-brand-muted text-xs">
                    {userToken ? 'Zarządzaj kontem' : 'Zaloguj się'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C77DFF" />
        </TouchableOpacity>

        <MenuRow 
          icon={<Ionicons name="bar-chart-outline" size={24} color="#C77DFF" />}
          title="Statystyki"
          subtitle="Postępy i makroskładniki"
          onPress={() => router.push('/stats')}
        />

        <MenuRow 
          icon={<Ionicons name="cart-outline" size={24} color="#E0AAFF" />}
          title="Lista zakupów"
          onPress={() => router.push('/ShoppingList')} // Upewnij się, że masz plik app/shopping.tsx lub app/(tabs)/shopping.tsx
        />
        
        <View className="h-6" />

        <MenuRow 
          icon={<Ionicons name="share-outline" size={24} color="#E0AAFF" />}
          title="Eksportuj dane (JSON)"
          onPress={exportData}
        />
        <MenuRow 
          icon={<Ionicons name="download-outline" size={24} color="#E0AAFF" />}
          title="Importuj dane"
          onPress={importData}
        />

        <View className="h-6" />

        <MenuRow 
          icon={<Ionicons name="settings-outline" size={24} color="#E0AAFF" />}
          title="Ustawienia"
          subtitle="BMR, Wzory, Aplikacja"
          onPress={() => router.push('/settings')}
        />

        {userToken && (
            <MenuRow 
            icon={<Ionicons name="log-out-outline" size={24} color="#EF4444" />}
            title="Wyloguj się"
            isDestructive
            onPress={logout}
            />
        )}
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}