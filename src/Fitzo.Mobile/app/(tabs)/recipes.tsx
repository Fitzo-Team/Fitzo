import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
interface RecipeCardProps {
  id: string;
  title: string;
  kcal: number;
  time: string;
  color: string;
}

const RecipeCard = ({ item }: { item: RecipeCardProps }) => (
  <TouchableOpacity className="mr-4 w-48 bg-brand-card rounded-2xl overflow-hidden border border-brand-accent shadow-md">
    <View className={`h-32 items-center justify-center ${item.color}`}>
       <MaterialCommunityIcons name="chef-hat" size={40} color="rgba(255,255,255,0.5)" />
    </View>
    
    <View className="p-3">
      <Text className="text-brand-text font-bold text-base mb-1" numberOfLines={1}>{item.title}</Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-brand-muted text-xs">{item.kcal} kcal</Text>
        <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#C77DFF" />
            <Text className="text-brand-muted text-xs ml-1">{item.time}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function RecipesScreen() {
  const router = useRouter();

  const myRecipes: RecipeCardProps[] = [
    { id: '1', title: 'Owsianka Królewska', kcal: 450, time: '10 min', color: 'bg-orange-500/20' },
    { id: '2', title: 'Kurczak z ryżem', kcal: 600, time: '25 min', color: 'bg-blue-500/20' },
  ];

  const popularRecipes: RecipeCardProps[] = [
    { id: '3', title: 'Pizza Proteinowa', kcal: 800, time: '40 min', color: 'bg-red-500/20' },
    { id: '4', title: 'Shake Bananowy', kcal: 300, time: '5 min', color: 'bg-yellow-500/20' },
    { id: '5', title: 'Sałatka Grecka', kcal: 250, time: '15 min', color: 'bg-green-500/20' },
  ];

  const renderSection = (title: string, data: RecipeCardProps[]) => (
    <View className="mb-8">
      <View className="flex-row justify-between items-center px-5 mb-4">
        <Text className="text-brand-text text-xl font-bold">{title}</Text>
        <TouchableOpacity>
            <Text className="text-brand-primary text-sm font-medium">Zobacz wszystkie</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => <RecipeCard item={item} />}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 mb-6 flex-row justify-between items-center">
        <Text className="text-brand-text text-3xl font-bold">Przepisy</Text>
        <TouchableOpacity 
            className="bg-brand-primary p-2 rounded-full"
            onPress={() => router.push({ pathname: '/add', params: { activeTab: 'recipe' } } as any)}
        >
            <Ionicons name="add" size={24} color="#E0AAFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSection('Twoje przepisy', myRecipes)}
        {renderSection('Popularne teraz', popularRecipes)}
        {renderSection('Wybrane dla Ciebie', [...popularRecipes].reverse())}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}