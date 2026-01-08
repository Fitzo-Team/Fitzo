import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFood } from '../../Context/FoodContext';
import { MealType } from '../../Types/Api';

const MEAL_SECTIONS: MealType[] = [
  MealType.Breakfast, 
  MealType.Lunch, 
  MealType.Dinner, 
  MealType.Snack
];

export default function JournalScreen() {
  const router = useRouter();
  const { dailyMeals, removeFood } = useFood();
  
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const days = [
    { day: 'P', num: '15', active: false },
    { day: 'W', num: '16', active: false },
    { day: 'Ś', num: '17', active: false },
    { day: 'C', num: '18', active: false },
    { day: 'P', num: '19', active: true },
    { day: 'S', num: '20', active: false },
    { day: 'N', num: '21', active: false },
  ];

  const handleDayOptions = () => {
    Alert.alert("Opcje dnia", "Kopiuj, wyczyść lub przesuń posiłki", [{ text: "Anuluj", style: "cancel" }]);
  };

  const goToAdd = (mealType: MealType) => {
    router.push({
      pathname: '/add',
      params: { initialMeal: mealType }
    });
  };

  const renderSection = (mealType: MealType) => {
    const key = `${currentDate}_${mealType}`;
    const items = dailyMeals[key] || [];
    const totalCals = items.reduce((acc, item) => acc + (item.calories || 0), 0);
    
    const plNames: Record<string, string> = {
      [MealType.Breakfast]: 'Śniadanie',
      [MealType.SecondBreakfast]: 'II Śniadanie',
      [MealType.Lunch]: 'Obiad',
      [MealType.Dinner]: 'Kolacja',
      [MealType.Snack]: 'Przekąska',
      [MealType.Supper]: 'Kolacja' 
    };

    const displayName = plNames[mealType] || mealType;

    return (
      <View key={mealType} className="mb-6">
        <View className="flex-row justify-between items-center mb-3 px-1">
          <View>
            <Text className="text-brand-text text-lg font-bold tracking-wide">{displayName}</Text>
            <Text className="text-brand-muted text-xs">{totalCals.toFixed(0)} kcal</Text>
          </View>
          
          <View className="flex-row items-center gap-3">
             <TouchableOpacity onPress={() => {}}>
               <MaterialCommunityIcons name="dots-vertical" size={24} color="#C77DFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-brand-primary w-9 h-9 rounded-full items-center justify-center shadow-md shadow-brand-dark"
              onPress={() => goToAdd(mealType)}
            >
              <Ionicons name="add" size={24} color="#E0AAFF" />
            </TouchableOpacity>
          </View>
        </View>

        {items.length === 0 ? (
          <TouchableOpacity onPress={() => goToAdd(mealType)} className="py-3 bg-brand-card/50 rounded-xl border border-dashed border-brand-accent items-center">
             <Text className="text-brand-muted text-sm font-medium">+ Dodaj pierwszy produkt</Text>
          </TouchableOpacity>
        ) : (
          items.map((item, index) => (
            <View key={`${item.id || index}`} className="flex-row justify-between items-center bg-brand-card p-4 rounded-xl mb-2 border border-brand-accent">
              <View>
                <Text className="text-brand-text font-medium">{item.name}</Text>
                <Text className="text-brand-muted text-xs">
                    {item.amount}g • {item.calories?.toFixed(0)} kcal
                </Text>
              </View>
              <TouchableOpacity 
                className="p-2"
                onPress={() => item.id && removeFood(currentDate, mealType, item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF9100" /> 
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  }

  const allItems = Object.keys(dailyMeals)
    .filter(k => k.startsWith(currentDate))
    .flatMap(k => dailyMeals[k]);
  
  const totalDailyCals = allItems.reduce((acc, i) => acc + (i.calories || 0), 0);
  const remaining = 2500 - totalDailyCals;

  return (
    <View className="flex-1 bg-brand-dark">
      
      <View className="h-48 bg-brand-card rounded-b-[35px] overflow-hidden pt-12 relative shadow-2xl shadow-brand-dark/80 border-b border-brand-accent">
        <View className="absolute inset-0 bg-brand-card" />
        <View className="absolute inset-0 bg-brand-primary/10" />

        <View className="flex-row justify-around px-2 z-10 mt-2">
          {days.map((d, index) => (
            <TouchableOpacity 
              key={index} 
              className={`items-center p-2 rounded-2xl w-10 ${d.active ? 'bg-brand-vivid shadow-lg shadow-brand-primary' : 'bg-transparent'}`}
            >
              <Text className={`text-xs mb-1 ${d.active ? 'text-white font-bold' : 'text-brand-muted'}`}>
                {d.day}
              </Text>
              <Text className={`text-base font-bold ${d.active ? 'text-white' : 'text-brand-text'}`}>
                {d.num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between items-center mt-auto pb-6 px-6">
           <View>
             <Text className="text-brand-muted text-xs uppercase font-bold tracking-widest">Pozostało</Text>
             <Text className="text-brand-text font-bold text-xl">
               {remaining.toFixed(0)} <Text className="text-sm font-normal text-brand-light">kcal</Text>
             </Text>
           </View>
           
           <TouchableOpacity onPress={handleDayOptions} className="flex-row items-center bg-brand-dark/30 px-3 py-2 rounded-xl border border-brand-accent/30">
              <MaterialCommunityIcons name="calendar-edit" size={20} color="#E0AAFF" />
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {MEAL_SECTIONS.map(renderSection)}
        <View className="h-28" />
      </ScrollView>
    </View>
  );
}