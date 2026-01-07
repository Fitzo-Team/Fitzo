import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart } from "react-native-chart-kit";
import { useAuth } from '../../Context/AuthContext';
import { useFood } from '../../Context/FoodContext';

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const { userData, userToken, weightHistory, fetchWeightHistory } = useAuth();
  const { dailyMeals, fetchDailyMeals } = useFood();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
      const today = new Date().toISOString(); 
      try {
        await Promise.all([
            fetchDailyMeals(today),
            fetchWeightHistory()
        ]);
      } catch (e) {
        console.error("Błąd ładowania dashboardu", e);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
      if(userToken) loadData();
      else setLoading(false);
  }, [userToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const allItems = Object.values(dailyMeals).reduce((acc, val) => acc.concat(val), []);
  
  const totalCalories = allItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalProtein = allItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const totalCarbs = allItems.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
  const totalFat = allItems.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

  const targetCalories = 2500; 
  const remainingCalories = targetCalories - totalCalories;
  
  const targetProtein = 180;
  const targetCarbs = 250;
  const targetFat = 80;

  const currentWeight = weightHistory.length > 0 
      ? weightHistory[weightHistory.length - 1].weight 
      : (userData?.weight || 0);

  const recentWeight = weightHistory.slice(-6);
  
  let chartLabels = recentWeight.map(w => {
      const d = new Date(w.date);
      return `${d.getDate()}.${d.getMonth() + 1}`;
  });
  
  let chartValues = recentWeight.map(w => Number(w.weight));

  if (chartValues.length === 0) {
      const w = Number(currentWeight) || 0;
      chartValues = [w, w];
      chartLabels = ["Start", "Teraz"];
  } else if (chartValues.length === 1) {
      chartValues = [chartValues[0], chartValues[0]];
      chartLabels = [chartLabels[0], chartLabels[0]];
  }

  const chartData = {
    labels: chartLabels,
    datasets: [{ data: chartValues }]
  };

  if (loading) {
      return <View className="flex-1 bg-brand-dark justify-center items-center"><ActivityIndicator color="#E0AAFF" size="large"/></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      
      <View className="flex-row justify-between items-center px-5 py-3">
        <TouchableOpacity 
            onPress={() => router.push('/profile')}
            className={`w-10 h-10 rounded-full items-center justify-center border border-brand-accent ${userToken ? 'bg-brand-vivid' : 'bg-brand-card'}`}
        >
            {userToken && userData?.username ? (
                <Text className="text-white font-bold text-lg">
                    {userData.username.charAt(0).toUpperCase()}
                </Text>
            ) : (
                <Ionicons name="person" size={20} color="white" />
            )}
        </TouchableOpacity>

        <Text className="text-2xl font-black text-white tracking-tighter">
          fitzo<Text className="text-brand-vivid">.</Text>
        </Text>

        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="white" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-dark" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E0AAFF" />}
      >

        <View className="px-5 mb-4 mt-2 flex-row justify-between items-end">
            <Text className="text-3xl font-bold text-white">Dzisiaj</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/journal')}>
                <Text className="text-brand-muted font-semibold mb-1">Szczegóły</Text>
            </TouchableOpacity>
        </View>

        <View className="mx-5 bg-brand-card rounded-3xl p-6 shadow-lg mb-5 border border-brand-accent">
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-white text-lg font-bold">Kalorie</Text>
                <Text className="text-brand-muted text-xs">Cel - Posiłki + Ćwicz.</Text>
            </View>

            <View className="flex-row items-center">
                <View className="w-28 h-28 rounded-full border-[8px] border-brand-vivid justify-center items-center mr-6">
                    <Text className="text-white text-3xl font-bold">{Math.max(0, remainingCalories).toFixed(0)}</Text>
                    <Text className="text-brand-muted text-xs">Pozostało</Text>
                </View>

                <View className="flex-1 gap-3">
                    <View>
                        <Text className="text-brand-muted text-xs">Cel podstawowy</Text>
                        <Text className="text-white font-bold text-lg">{targetCalories}</Text>
                    </View>
                    <View>
                        <Text className="text-brand-muted text-xs">Posiłki</Text>
                        <Text className="text-white font-bold text-lg">{totalCalories.toFixed(0)}</Text>
                    </View>
                </View>
            </View>
        </View>

        <View className="mx-5 bg-brand-card rounded-3xl p-6 shadow-lg mb-5 border border-brand-accent">
            <Text className="text-white text-lg font-bold mb-4">Makroskładniki</Text>
            <View className="gap-5">

                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-brand-text font-semibold">Białko</Text>
                        <Text className="text-brand-muted text-xs">{totalProtein.toFixed(0)} / {targetProtein} g</Text>
                    </View>
                    <View className="h-3 bg-brand-dark rounded-full overflow-hidden">
                        <View style={{ width: `${Math.min((totalProtein/targetProtein)*100, 100)}%` }} className="h-full bg-blue-500 rounded-full" />
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-brand-text font-semibold">Węglowodany</Text>
                        <Text className="text-brand-muted text-xs">{totalCarbs.toFixed(0)} / {targetCarbs} g</Text>
                    </View>
                    <View className="h-3 bg-brand-dark rounded-full overflow-hidden">
                        <View style={{ width: `${Math.min((totalCarbs/targetCarbs)*100, 100)}%` }} className="h-full bg-green-500 rounded-full" />
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-brand-text font-semibold">Tłuszcze</Text>
                        <Text className="text-brand-muted text-xs">{totalFat.toFixed(0)} / {targetFat} g</Text>
                    </View>
                    <View className="h-3 bg-brand-dark rounded-full overflow-hidden">
                        <View style={{ width: `${Math.min((totalFat/targetFat)*100, 100)}%` }} className="h-full bg-brand-flame rounded-full" />
                    </View>
                </View>
            </View>
        </View>

        <View className="mx-5 bg-brand-card rounded-3xl p-5 mb-5 border border-brand-accent overflow-hidden">
             <View className="flex-row justify-between items-center mb-4">
                 <View>
                    <Text className="text-brand-muted font-semibold mb-1">Waga</Text>
                    <Text className="text-3xl font-bold text-white">{currentWeight || '--'} <Text className="text-lg text-brand-muted font-normal">kg</Text></Text>
                 </View>
                 <TouchableOpacity 
                    className="bg-brand-primary p-3 rounded-full"
                    onPress={() => router.push('/profile')}
                 >
                    <Ionicons name="add" size={24} color="white" />
                 </TouchableOpacity>
             </View>

             {chartValues.length > 0 && !chartValues.some(isNaN) ? (
                 <LineChart
                    data={chartData}
                    width={screenWidth - 80} 
                    height={160}
                    yAxisSuffix="kg"
                    withInnerLines={false}
                    withOuterLines={false}
                    withHorizontalLabels={false}
                    chartConfig={{
                        backgroundColor: "#240046",
                        backgroundGradientFrom: "#240046",
                        backgroundGradientTo: "#240046",
                        decimalPlaces: 1, 
                        color: (opacity = 1) => `rgba(224, 170, 255, ${opacity})`, 
                        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, 
                        style: { borderRadius: 16 },
                        propsForDots: { r: "4", strokeWidth: "2", stroke: "#9D4EDD" }
                    }}
                    bezier 
                    style={{ marginVertical: 8, borderRadius: 16, paddingRight: 0, marginLeft: -10 }}
                />
             ) : (
                 <Text className="text-brand-muted text-center py-4">Brak danych do wykresu</Text>
             )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}