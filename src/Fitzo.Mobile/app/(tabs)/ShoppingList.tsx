import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../../Context/FoodContext';

export default function ShoppingListScreen() {
  const router = useRouter();
  const { shoppingList, fetchShoppingList, isLoading } = useFood();

  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    fetchShoppingList(now, nextWeek);
  }, []);

  return (
    <View className="flex-1 bg-brand-dark pt-12 px-5">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
        </TouchableOpacity>
        <Text className="text-brand-text text-2xl font-bold">Lista Zakupów</Text>
      </View>

      {isLoading ? (
          <ActivityIndicator color="#E0AAFF" size="large" />
      ) : (
          <FlatList
            data={shoppingList}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
                <Text className="text-brand-muted text-center mt-10">
                    Brak produktów zaplanowanych na ten tydzień.
                </Text>
            }
            renderItem={({ item }) => (
                <View className="flex-row items-center bg-brand-card p-4 rounded-xl mb-3 border border-brand-accent">
                    <View className={`w-6 h-6 rounded border mr-4 ${item.isBought ? 'bg-brand-primary border-brand-primary' : 'border-brand-muted'}`}>
                        {item.isBought && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <View className="flex-1">
                        <Text className={`text-lg ${item.isBought ? 'text-brand-muted line-through' : 'text-brand-text'}`}>
                            {item.name}
                        </Text>
                        <Text className="text-brand-muted text-xs">
                            {item.totalAmount} {item.unit}
                        </Text>
                    </View>
                </View>
            )}
          />
      )}
    </View>
  );
}