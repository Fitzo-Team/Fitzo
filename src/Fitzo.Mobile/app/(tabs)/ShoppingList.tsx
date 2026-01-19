import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../../Context/FoodContext';
import { ShoppingListItem } from '../../Context/FoodContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
    "Vegetables": "Warzywa",
    "Fruits": "Owoce",
    "Dairy": "Nabiał",
    "Meat": "Mięso i Ryby",
    "Grains": "Produkty Zbożowe",
    "Fats": "Tłuszcze",
    "Sweets": "Słodycze",
    "Beverages": "Napoje",
    "NutsAndSeeds": "Orzechy i Nasiona",
    "SpicesSauces": "Przyprawy i Sosy",
    "Unknown": "Inne",
    "Inne": "Inne"
};

export default function ShoppingListScreen() {
  const { shoppingList, fetchShoppingList, toggleShoppingItem, isLoading } = useFood();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
  });
  
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
      fetchShoppingList(startDate, endDate);
  }, []);

  const groupedList = useMemo(() => {
      const groups: Record<string, ShoppingListItem[]> = {};
      
      shoppingList.forEach(item => {
          const catKey = item.category || "Unknown";
          if (!groups[catKey]) {
              groups[catKey] = [];
          }
          groups[catKey].push(item);
      });

      return groups;
  }, [shoppingList]);

  const sortedCategories = Object.keys(groupedList).sort((a, b) => {
      if (a === "Unknown" || a === "Inne") return 1;
      if (b === "Unknown" || b === "Inne") return -1;
      return a.localeCompare(b);
  });

  const changeDate = (isStart: boolean, days: number) => {
      const target = isStart ? startDate : endDate;
      const newDate = new Date(target);
      newDate.setDate(target.getDate() + days);
      if (isStart) setStartDate(newDate);
      else setEndDate(newDate);
  };

  const handleGenerate = () => fetchShoppingList(startDate, endDate);

  const toggleExpand = (name: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedItem(expandedItem === name ? null : name);
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return (
    <View className="flex-1 bg-brand-dark pt-12 px-5">
      <Text className="text-brand-text text-2xl font-bold mb-4">Lista Zakupów</Text>

      <View className="bg-brand-card p-4 rounded-2xl border border-brand-accent mb-4">
          <View className="flex-row justify-between mb-4">
              <View className="items-center">
                  <Text className="text-brand-muted text-xs mb-1">Początek</Text>
                  <View className="flex-row items-center gap-2">
                      <TouchableOpacity onPress={() => changeDate(true, -1)}><Ionicons name="chevron-back" size={24} color="#E0AAFF" /></TouchableOpacity>
                      <Text className="text-white font-bold">{formatDate(startDate)}</Text>
                      <TouchableOpacity onPress={() => changeDate(true, 1)}><Ionicons name="chevron-forward" size={24} color="#E0AAFF" /></TouchableOpacity>
                  </View>
              </View>
              <View className="w-[1px] bg-brand-accent/50" />
              <View className="items-center">
                  <Text className="text-brand-muted text-xs mb-1">Koniec</Text>
                  <View className="flex-row items-center gap-2">
                      <TouchableOpacity onPress={() => changeDate(false, -1)}><Ionicons name="chevron-back" size={24} color="#E0AAFF" /></TouchableOpacity>
                      <Text className="text-white font-bold">{formatDate(endDate)}</Text>
                      <TouchableOpacity onPress={() => changeDate(false, 1)}><Ionicons name="chevron-forward" size={24} color="#E0AAFF" /></TouchableOpacity>
                  </View>
              </View>
          </View>
          <TouchableOpacity onPress={handleGenerate} className="bg-brand-primary p-3 rounded-xl items-center">
              <Text className="text-brand-text font-bold">Generuj Listę</Text>
          </TouchableOpacity>
      </View>

      {isLoading ? (
          <ActivityIndicator size="large" color="#E0AAFF" className="mt-10" />
      ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              {shoppingList.length === 0 ? (
                  <Text className="text-brand-muted text-center mt-10">Brak produktów w planie na ten okres.</Text>
              ) : (
                  sortedCategories.map((category) => (
                      <View key={category} className="mb-6">
                          <View className="flex-row items-center mb-2 px-1">
                              <View className="h-[1px] flex-1 bg-brand-accent/50" />
                              <Text className="text-brand-vivid font-bold mx-3 uppercase text-sm tracking-wider">
                                  {CATEGORY_TRANSLATIONS[category] || category}
                              </Text>
                              <View className="h-[1px] flex-1 bg-brand-accent/50" />
                          </View>

                          {groupedList[category].map((item, index) => (
                              <View key={`${category}_${index}`} className="mb-2 bg-brand-card rounded-xl overflow-hidden border border-brand-accent/30">
                                  <TouchableOpacity 
                                      onPress={() => toggleShoppingItem(item.name)} 
                                      onLongPress={() => toggleExpand(item.name)}
                                      className="p-4 flex-row items-center"
                                  >
                                      <View className={`w-6 h-6 rounded border mr-4 justify-center items-center ${item.isBought ? 'bg-brand-success border-brand-success' : 'border-brand-muted'}`}>
                                          {item.isBought && <Ionicons name="checkmark" size={16} color="black" />}
                                      </View>
                                      
                                      <View className="flex-1">
                                          <Text className={`text-lg font-medium ${item.isBought ? 'text-brand-muted line-through' : 'text-brand-text'}`}>
                                              {item.name}
                                          </Text>
                                      </View>
                                      
                                      <View className="items-end">
                                          <Text className="text-brand-vivid font-bold text-base">
                                              {Math.round(item.totalAmount * 10) / 10} {item.unit}
                                          </Text>
                                          <TouchableOpacity onPress={() => toggleExpand(item.name)} className="mt-1 p-1">
                                              <Ionicons name={expandedItem === item.name ? "chevron-up" : "chevron-down"} size={16} color="#999" />
                                          </TouchableOpacity>
                                      </View>
                                  </TouchableOpacity>

                                  {expandedItem === item.name && (
                                      <View className="bg-brand-dark/50 p-3 border-t border-brand-accent/20">
                                          <Text className="text-brand-muted text-xs mb-1 font-bold">Potrzebne do:</Text>
                                          {item.sources.map((source, sIndex) => (
                                              <View key={sIndex} className="flex-row items-center mb-1">
                                                  <Ionicons name="restaurant-outline" size={10} color="#888" style={{marginRight: 6}}/>
                                                  <Text className="text-gray-400 text-xs">{source}</Text>
                                              </View>
                                          ))}
                                      </View>
                                  )}
                              </View>
                          ))}
                      </View>
                  ))
              )}
          </ScrollView>
      )}
    </View>
  );
}