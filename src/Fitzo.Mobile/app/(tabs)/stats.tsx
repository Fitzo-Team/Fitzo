import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../Services/ApiClient';

const ProgressBar = ({ value, max, color, label, suffix = "g" }: any) => {
    const safeMax = max || 1; 
    const safeValue = value || 0;
    const percentage = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));
    
    return (
        <View className="mb-5">
            <View className="flex-row justify-between mb-2">
                <Text className="text-brand-text font-bold text-base">{label}</Text>
                <Text className="text-brand-muted text-sm font-medium">{safeValue.toFixed(0)} / {safeMax} {suffix}</Text>
            </View>
            <View className="h-4 bg-brand-dark rounded-full overflow-hidden border border-brand-accent/30">
                <View style={{ width: `${percentage}%`, backgroundColor: color }} className="h-full rounded-full" />
            </View>
        </View>
    );
};

export default function StatsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
      try {
          const res = await apiClient.get('/api/Stats');
          setStats(res.data);
      } catch (e) {
          console.log("Błąd pobierania statystyk:", e);
      } finally {
          setIsLoading(false);
      }
  };

  const data = stats || {
      dailyCalories: 0,
      targetCalories: 2500,
      totalProtein: 0,
      targetProtein: 150,
      totalFat: 0,
      targetFat: 80,
      totalCarbs: 0,
      targetCarbs: 300,
      streakDays: 0
  };

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full border border-brand-accent">
          <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
        </TouchableOpacity>
        <Text className="text-brand-text text-2xl font-bold">Statystyki</Text>
      </View>

      {isLoading ? (
          <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#E0AAFF" />
          </View>
      ) : (
          <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
              
              <View className="bg-brand-card p-6 rounded-3xl border border-brand-accent mb-6 items-center shadow-lg shadow-brand-primary/20">
                  <Text className="text-brand-muted text-xs uppercase font-bold tracking-widest mb-2">Dzisiejsze spożycie</Text>
                  <Text className="text-6xl font-black text-white mb-1 tracking-tighter">
                      {data.dailyCalories?.toFixed(0)}
                  </Text>
                  <View className="bg-brand-dark/50 px-4 py-1 rounded-full border border-brand-accent/30">
                    <Text className="text-brand-muted text-sm">
                        Cel: <Text className="text-brand-vivid font-bold">{data.targetCalories?.toFixed(0)}</Text> kcal
                    </Text>
                  </View>
              </View>

              <View className="bg-brand-card p-6 rounded-3xl border border-brand-accent mb-6">
                  <Text className="text-white text-xl font-bold mb-6">Makroskładniki</Text>
                  
                  <ProgressBar 
                      label="Białko" 
                      value={data.totalProtein} 
                      max={data.targetProtein} 
                      color="#3B82F6" 
                  />
                  <ProgressBar 
                      label="Tłuszcze" 
                      value={data.totalFat} 
                      max={data.targetFat} 
                      color="#EAB308" 
                  />
                  <ProgressBar 
                      label="Węglowodany" 
                      value={data.totalCarbs} 
                      max={data.targetCarbs} 
                      color="#10B981" 
                  />
              </View>

              <View className="flex-row gap-4 mb-10">
                  <View className="flex-1 bg-brand-card p-5 rounded-3xl border border-brand-accent items-center">
                      <View className="w-12 h-12 bg-orange-500/20 rounded-full items-center justify-center mb-2">
                        <Ionicons name="flame" size={28} color="#F97316" />
                      </View>
                      <Text className="text-3xl font-bold text-white">{data.streakDays || 0}</Text>
                      <Text className="text-brand-muted text-xs font-bold uppercase">Dni z rzędu</Text>
                  </View>
                  
                  <View className="flex-1 bg-brand-card p-5 rounded-3xl border border-brand-accent items-center opacity-70">
                      <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mb-2">
                        <Ionicons name="trophy" size={28} color="#C084FC" />
                      </View>
                      <Text className="text-3xl font-bold text-white">--</Text>
                      <Text className="text-brand-muted text-xs font-bold uppercase">Poziom</Text>
                  </View>
              </View>

          </ScrollView>
      )}
    </View>
  );
}