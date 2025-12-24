import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ActionModal() {
  return (
    <View className="flex-1 justify-end bg-transparent">
      <TouchableOpacity 
        className="flex-1" 
        onPress={() => router.back()} 
      />

      <View className="bg-white rounded-t-3xl p-6 shadow-lg">
        <Text className="text-xl font-bold text-center mb-6">Szybki wybór</Text>

        <TouchableOpacity className="flex-row items-center p-4 bg-orange-100 rounded-xl mb-4">
            <View className="bg-orange-500 p-2 rounded-full mr-4">
                <Ionicons name="fast-food" size={24} color="white" />
            </View>
            <Text className="text-lg font-semibold">Dodaj Posiłek</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-4 bg-blue-100 rounded-xl mb-4">
            <View className="bg-blue-500 p-2 rounded-full mr-4">
                <Ionicons name="fitness" size={24} color="white" />
            </View>
            <Text className="text-lg font-semibold">Dodaj Trening</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            className="mt-2 items-center" 
            onPress={() => router.back()}
        >
            <Text className="text-gray-500 text-lg">Anuluj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}