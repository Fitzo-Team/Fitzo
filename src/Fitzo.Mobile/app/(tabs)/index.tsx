import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle, G } from 'react-native-svg';
import { useAuth } from '../../Context/AuthContext';
import { useFood } from '../../Context/FoodContext';

const screenWidth = Dimensions.get("window").width;

const ProgressCircle = ({ percentage, color }: { percentage: number, color: string }) => {
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(percentage, 1) * circumference);

    return (
        <View className="justify-center items-center mr-6">
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference}
                     strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" />
                </G>
            </Svg>
            <View className="absolute inset-0 justify-center items-center">
                <Text className="text-white font-bold text-lg">{Math.round(percentage * 100)}%</Text>
            </View>
        </View>
    );
};

export default function HomeScreen() {
  const router = useRouter();
  
  const { userData, userToken, weightHistory, fetchWeightHistory, userBmr } = useAuth();
  const { dailyMeals, fetchDailyMeals } = useFood();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentBMR = userBmr || 2500;

  const loadData = async () => {
      const today = new Date().toISOString(); 
      try {
        await Promise.all([
            fetchDailyMeals(today),
            fetchWeightHistory(),
        ]);
      } catch (e) {
        console.error("Load error", e);
      } finally {
        setLoading(false);
      }
  };

  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        loadData();
      }
    }, [userToken])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const todayKey = new Date().toISOString().split('T')[0];
  const todaysItems = Object.keys(dailyMeals)
    .filter(key => key.startsWith(todayKey))
    .flatMap(key => dailyMeals[key]);

  const totalCalories = todaysItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalProtein = todaysItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const totalCarbs = todaysItems.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
  const totalFat = todaysItems.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

  const remainingCalories = currentBMR - totalCalories;
  const isOverLimit = remainingCalories < 0;
  const progressPercentage = totalCalories / (currentBMR || 1);

  const targetProtein = Math.round((currentBMR * 0.20) / 4);
  const targetCarbs = Math.round((currentBMR * 0.50) / 4);
  const targetFat = Math.round((currentBMR * 0.30) / 9);

  const currentWeight = weightHistory.length > 0 
      ? weightHistory[weightHistory.length - 1].weight 
      : (userData?.weight || 0);

  let chartValues: number[] = [];
  let chartLabels: string[] = [];

  if (weightHistory.length > 0) {
      const recent = weightHistory.slice(-6);
      chartValues = recent.map(w => Number(w.weight));
      chartLabels = recent.map(w => {
          const d = new Date(w.date);
          return `${d.getDate()}.${d.getMonth() + 1}`;
      });
  }

  if (chartValues.length === 0) {
      const w = Number(currentWeight) || 70;
      chartValues = [w, w];
      chartLabels = ["Start", "Now"];
  } else if (chartValues.length === 1) {
      chartValues = [chartValues[0], chartValues[0]];
      chartLabels = [chartLabels[0], chartLabels[0]];
  }

  const chartData = {
    labels: chartLabels,
    datasets: [{ data: chartValues }]
  };

  if (loading && !userData) {
      return <View className="flex-1 bg-brand-dark justify-center items-center"><ActivityIndicator color="#E0AAFF" size="large"/></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="flex-row justify-between items-center px-5 py-3">
        <TouchableOpacity 
            onPress={() => router.push('/settings')}
            className={`w-10 h-10 rounded-full items-center justify-center border border-brand-accent ${userToken ? 'bg-brand-vivid' : 'bg-brand-card'} overflow-hidden`}
        >
            {userToken && userData?.imageUrl ? (
                <View className="w-full h-full">
                    <Text className="text-white font-bold text-xs text-center mt-3">IMG</Text> 
                </View>
            ) : userToken && userData?.username ? (
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
                <Text className="text-brand-muted text-xs">Cel: {currentBMR.toFixed(0)} kcal</Text>
            </View>

            <View className="flex-row items-center">
                <ProgressCircle percentage={progressPercentage} color={isOverLimit ? "#EF4444" : "#FFFFFF"} />
                <View className="flex-1 gap-3">
                    <View>
                        <Text className="text-brand-muted text-xs uppercase font-bold">{isOverLimit ? "Przekroczono o" : "Pozostało"}</Text>
                        <Text className={`font-bold text-3xl ${isOverLimit ? "text-red-500" : "text-white"}`}>
                            {Math.abs(remainingCalories).toFixed(0)} <Text className="text-sm font-normal text-brand-muted">kcal</Text>
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between border-t border-brand-dark pt-2">
                        <Text className="text-brand-muted text-xs">Spożyte</Text>
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
                 <TouchableOpacity className="bg-brand-primary p-3 rounded-full" onPress={() => router.push('/settings')}>
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
                    withHorizontalLabels={true}
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
                    style={{ marginVertical: 8, borderRadius: 16, paddingRight: 40, marginLeft: -20 }}
                />
             ) : (
                 <Text className="text-brand-muted text-center">Brak danych wagi</Text>
             )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}