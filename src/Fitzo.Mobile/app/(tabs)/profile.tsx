import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../Context/AuthContext';
import { TextInput, Alert } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { userToken, userData, logout } = useAuth();
const [newWeight, setNewWeight] = useState('');
const { addWeight } = useAuth();

const handleUpdateWeight = async () => {
    const w = parseFloat(newWeight);
    if (!w || isNaN(w)) {
        Alert.alert("Błąd", "Podaj poprawną wagę");
        return;
    }
    await addWeight(w, new Date());
    setNewWeight('');
};

// ... w JSX w sekcji statystyk wagi
<View className="bg-brand-card p-4 rounded-2xl border border-brand-accent mt-4">
    <Text className="text-brand-text font-bold mb-2">Zaktualizuj wagę</Text>
    <View className="flex-row gap-2">
        <TextInput 
            className="flex-1 bg-brand-dark text-white p-3 rounded-xl border border-brand-accent"
            placeholder="np. 76.5"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={newWeight}
            onChangeText={setNewWeight}
        />
        <TouchableOpacity 
            className="bg-brand-primary justify-center px-4 rounded-xl"
            onPress={handleUpdateWeight}
        >
            <Ionicons name="save-outline" size={24} color="white" />
        </TouchableOpacity>
    </View>
</View>
  if (!userToken) {
    return (
      <View className="flex-1 bg-brand-dark justify-center items-center px-6">
        <View className="w-24 h-24 bg-brand-card rounded-full items-center justify-center mb-6 border border-brand-accent shadow-lg shadow-brand-primary/20">
            <Ionicons name="person-outline" size={48} color="#C77DFF" />
        </View>
        <Text className="text-brand-text text-2xl font-bold mb-2">Profil Gościa</Text>
        <Text className="text-brand-muted text-center mb-8">
          Twoje dane są zapisywane tylko lokalnie. Zaloguj się, aby synchronizować postępy, tworzyć kopie zapasowe i korzystać z funkcji społeczności.
        </Text>
        <TouchableOpacity 
          className="bg-brand-primary w-full py-4 rounded-2xl items-center shadow-lg shadow-brand-dark"
          onPress={() => router.push('/login')}
        >
          <Text className="text-brand-text font-bold text-lg">Zaloguj / Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row items-center mb-8">
          <View className="w-20 h-20 bg-brand-vivid rounded-full items-center justify-center border-2 border-brand-light">
             <Text className="text-white text-3xl font-bold">{userData?.username?.charAt(0).toUpperCase()}</Text>
          </View>
          <View className="ml-4 flex-1">
             <Text className="text-brand-text text-2xl font-bold">{userData?.username}</Text>
             <Text className="text-brand-muted">{userData?.email}</Text>
             <TouchableOpacity className="mt-2 bg-brand-card self-start px-3 py-1 rounded-lg border border-brand-accent">
                <Text className="text-brand-light text-xs font-bold">Edytuj profil</Text>
             </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row gap-4 mb-6">
           <View className="flex-1 bg-brand-card p-4 rounded-2xl border border-brand-accent items-center">
              <MaterialCommunityIcons name="fire" size={28} color="#FF9100" />
              <Text className="text-brand-text font-bold text-xl mt-2">12</Text>
              <Text className="text-brand-muted text-xs">Dni z rzędu</Text>
           </View>
           <View className="flex-1 bg-brand-card p-4 rounded-2xl border border-brand-accent items-center">
              <MaterialCommunityIcons name="weight-kilogram" size={28} color="#3B82F6" />
              <Text className="text-brand-text font-bold text-xl mt-2">{userData?.weight || '--'} kg</Text>
              <Text className="text-brand-muted text-xs">Aktualna waga</Text>
           </View>
           <View className="flex-1 bg-brand-card p-4 rounded-2xl border border-brand-accent items-center">
              <MaterialCommunityIcons name="human-male-height" size={28} color="#10B981" />
              <Text className="text-brand-text font-bold text-xl mt-2">{userData?.height || '--'}</Text>
              <Text className="text-brand-muted text-xs">Wzrost cm</Text>
           </View>
        </View>

        <View className="bg-brand-card p-5 rounded-2xl border border-brand-accent mb-6">
           <Text className="text-brand-muted text-xs uppercase font-bold mb-2">Twój Cel</Text>
           <Text className="text-brand-text text-lg font-bold mb-2">{userData?.goal || 'Brak celu'}</Text>
           <View className="h-2 bg-brand-dark rounded-full overflow-hidden">
              <View className="h-full w-[60%] bg-brand-primary" />
           </View>
           <Text className="text-brand-muted text-xs mt-2 text-right">Postęp: 60%</Text>
        </View>

        <Text className="text-brand-muted text-xs uppercase font-bold mb-3 ml-1">Konto</Text>
        <View className="bg-brand-card rounded-2xl overflow-hidden border border-brand-accent mb-8">
           <TouchableOpacity className="flex-row items-center p-4 border-b border-brand-dark">
              <Ionicons name="notifications-outline" size={22} color="#E0AAFF" />
              <Text className="text-brand-text ml-3 flex-1">Powiadomienia</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
           </TouchableOpacity>
           <TouchableOpacity className="flex-row items-center p-4 border-b border-brand-dark">
              <Ionicons name="lock-closed-outline" size={22} color="#E0AAFF" />
              <Text className="text-brand-text ml-3 flex-1">Zmiana hasła</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
           </TouchableOpacity>
           <TouchableOpacity className="flex-row items-center p-4" onPress={logout}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text className="text-red-400 ml-3 flex-1">Wyloguj się</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}