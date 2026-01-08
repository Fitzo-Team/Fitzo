import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFood } from '../../Context/FoodContext';
import { useAuth } from '../../Context/AuthContext';
import { MealType } from '../../Types/Api';

const ALL_MEAL_SECTIONS: MealType[] = [
  MealType.Breakfast, MealType.SecondBreakfast, MealType.Lunch, 
  MealType.Dinner, MealType.Snack, MealType.Supper
];

const getDayName = (date: Date) => ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'][date.getDay()];

const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(date);
};

export default function JournalScreen() {
  const router = useRouter();
  const { dailyMeals, removeFood, fetchDailyMeals } = useFood();
  const { fetchBMR } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [targetCalories, setTargetCalories] = useState(2500);
  
  const [visibleSections, setVisibleSections] = useState<MealType[]>([
      MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack
  ]);
  
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
      const dateStr = currentDate.toISOString().split('T')[0];
      fetchDailyMeals(dateStr);
      fetchBMR().then(bmr => setTargetCalories(bmr));
  }, [currentDate]);

  const calendarDays = useMemo(() => {
      const days = [];
      for (let i = -3; i <= 3; i++) {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + i);
          days.push(d);
      }
      return days;
  }, [currentDate]);

  const goToAdd = (mealType: MealType) => {
    router.push({
      pathname: '/add',
      params: { 
          initialMeal: mealType,
          date: currentDate.toISOString() 
      }
    });
  };

  const renderSection = (mealType: MealType) => {
    const dateKey = currentDate.toISOString().split('T')[0];
    const key = `${dateKey}_${mealType}`;
    const items = dailyMeals[key] || [];
    const totalCals = items.reduce((acc, item) => acc + (item.calories || 0), 0);
    
    const plNames: Record<string, string> = {
      [MealType.Breakfast]: 'Śniadanie', [MealType.SecondBreakfast]: 'II Śniadanie',
      [MealType.Lunch]: 'Obiad', [MealType.Dinner]: 'Kolacja', 
      [MealType.Snack]: 'Przekąska', [MealType.Supper]: 'Kolacja (Późna)' 
    };

    return (
      <View key={mealType} className="mb-6">
        <View className="flex-row justify-between items-center mb-3 px-1">
          <View>
            <Text className="text-brand-text text-lg font-bold tracking-wide">{plNames[mealType] || mealType}</Text>
            <Text className="text-brand-muted text-xs">{totalCals.toFixed(0)} kcal</Text>
          </View>
          <TouchableOpacity onPress={() => goToAdd(mealType)}>
             <Ionicons name="add-circle" size={32} color="#E0AAFF" />
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <TouchableOpacity onPress={() => goToAdd(mealType)} className="py-4 bg-brand-card/30 rounded-2xl border border-dashed border-brand-accent/50 items-center justify-center">
             <Text className="text-brand-muted text-sm font-medium">Dodaj produkt</Text>
          </TouchableOpacity>
        ) : (
          items.map((item, index) => (
            <View key={`${item.id || index}`} className="flex-row justify-between items-center bg-brand-card p-4 rounded-2xl mb-2 border border-brand-accent shadow-sm">
              <View className="flex-1 mr-4">
                <Text className="text-brand-text font-bold text-base" numberOfLines={1}>{item.name}</Text>
                <Text className="text-brand-muted text-xs mt-1">
                    {item.amount}g  •  <Text className="text-brand-vivid">{item.calories?.toFixed(0)} kcal</Text>
                </Text>
              </View>
              <TouchableOpacity 
                className="p-2 bg-brand-dark/50 rounded-lg"
                onPress={() => item.id && removeFood(dateKey, mealType, item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF9100" /> 
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  }

  const dateKey = currentDate.toISOString().split('T')[0];
  const allItems = Object.keys(dailyMeals).filter(k => k.startsWith(dateKey)).flatMap(k => dailyMeals[k]);
  const totalDailyCals = allItems.reduce((acc, i) => acc + (i.calories || 0), 0);
  const remaining = targetCalories - totalDailyCals;

  return (
    <View className="flex-1 bg-brand-dark">
      
      <View className="bg-brand-card rounded-b-[35px] pt-12 pb-6 shadow-2xl shadow-brand-dark/80 border-b border-brand-accent overflow-hidden relative">
        <View className="absolute inset-0 bg-brand-primary/5" />

        <Text className="text-center text-brand-text font-bold text-lg mb-4 capitalize">
            {getMonthName(currentDate)}
        </Text>

        <View className="flex-row justify-around px-2 mb-4">
          {calendarDays.map((d, index) => {
             const isSelected = d.getDate() === currentDate.getDate();
             const isToday = d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth();
             
             return (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setCurrentDate(d)}
                  className={`items-center py-3 w-12 rounded-2xl border 
                    ${isSelected ? 'bg-brand-vivid border-brand-vivid shadow-lg shadow-brand-primary' : 'bg-transparent'} 
                    ${isToday && !isSelected ? 'border-brand-text/50' : 'border-transparent'}
                  `}
                >
                  <Text className={`text-xs mb-1 ${isSelected ? 'text-white font-bold' : 'text-brand-muted'}`}>
                    {getDayName(d)}
                  </Text>
                  <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-brand-text'}`}>
                    {d.getDate()}
                  </Text>
                  {isToday && !isSelected && <View className="w-1 h-1 bg-brand-text rounded-full mt-1" />}
                </TouchableOpacity>
             )
          })}
        </View>

        <View className="flex-row justify-between items-center px-6">
           <View>
             <Text className="text-brand-muted text-xs uppercase font-bold tracking-widest">
                 {remaining < 0 ? "Przekroczono" : "Pozostało"}
             </Text>
             <Text className={`text-2xl font-black ${remaining < 0 ? 'text-red-500' : 'text-white'}`}>
               {Math.abs(remaining).toFixed(0)} <Text className="text-sm font-normal text-brand-light">kcal</Text>
             </Text>
           </View>
           
           <TouchableOpacity onPress={() => setIsOptionsOpen(true)} className="flex-row items-center bg-brand-dark/40 px-4 py-3 rounded-2xl border border-brand-accent/30 active:bg-brand-primary/20">
              <MaterialCommunityIcons name="tune" size={20} color="#E0AAFF" />
              <Text className="text-brand-text font-bold ml-2 text-sm">Opcje</Text>
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {visibleSections.map(renderSection)}
        <TouchableOpacity onPress={() => setIsEditMode(true)} className="mb-32 flex-row items-center justify-center p-4 border border-dashed border-brand-accent/30 rounded-2xl">
            <Ionicons name="add" size={20} color="#666" />
            <Text className="text-brand-muted ml-2">Zarządzaj posiłkami</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isOptionsOpen} animationType="fade" transparent>
        <TouchableOpacity activeOpacity={1} onPress={() => setIsOptionsOpen(false)} className="flex-1 bg-black/60 justify-end">
            <TouchableWithoutFeedback>
                <View className="bg-brand-card rounded-t-3xl p-6 border-t border-brand-accent">
                    <Text className="text-white text-xl font-bold mb-6 text-center">Opcje dnia</Text>
                    
                    <TouchableOpacity 
                        className="flex-row items-center p-4 bg-brand-dark rounded-xl mb-3"
                        onPress={() => { setIsOptionsOpen(false); setIsEditMode(true); }}
                    >
                        <Ionicons name="list" size={24} color="#E0AAFF" />
                        <Text className="text-brand-text ml-4 font-bold">Zmień widoczne posiłki</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center p-4 bg-red-500/10 rounded-xl mb-6"
                        onPress={() => {
                            Alert.alert("Wyczyścić?", "To usunie wszystkie posiłki z tego dnia.", [{ text: "Tak", style: "destructive" }, { text: "Nie" }]);
                            setIsOptionsOpen(false);
                        }}
                    >
                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                        <Text className="text-red-500 ml-4 font-bold">Wyczyść cały dzień</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="py-4 items-center" onPress={() => setIsOptionsOpen(false)}>
                        <Text className="text-brand-muted font-bold">Anuluj</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isEditMode} animationType="slide" transparent>
          <View className="flex-1 bg-black/80 justify-end">
              <View className="bg-brand-card rounded-t-3xl p-6 border-t border-brand-accent h-[70%]">
                  <Text className="text-white text-xl font-bold mb-4">Widoczne posiłki</Text>
                  <ScrollView>
                    {ALL_MEAL_SECTIONS.map(meal => {
                        const isActive = visibleSections.includes(meal);
                        return (
                            <TouchableOpacity 
                                key={meal}
                                className={`flex-row items-center p-4 mb-2 rounded-xl border ${isActive ? 'bg-brand-primary/20 border-brand-primary' : 'bg-brand-dark border-brand-dark'}`}
                                onPress={() => isActive ? setVisibleSections(prev => prev.filter(m => m !== meal)) : setVisibleSections(prev => [...prev, meal])}
                            >
                                <Ionicons name={isActive ? "checkbox" : "square-outline"} size={24} color={isActive ? "#E0AAFF" : "#666"} />
                                <Text className={`ml-4 text-lg ${isActive ? 'text-white font-bold' : 'text-brand-muted'}`}>{meal}</Text>
                            </TouchableOpacity>
                        )
                    })}
                  </ScrollView>
                  <TouchableOpacity className="bg-brand-primary p-4 rounded-xl items-center mt-4" onPress={() => setIsEditMode(false)}>
                      <Text className="text-brand-text font-bold text-lg">Gotowe</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
}