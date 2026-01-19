import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../Services/ApiClient';
import { useAuth } from '../../Context/AuthContext';

interface DailySummary {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
}

interface StatsDto {
    weeklySummary: DailySummary[];
    averageDailyCaloriesWeek: number;
    averageDailyCaloriesMonth: number;
    currentWeight: number;
}

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
  const { fetchBMR } = useAuth();
  
  const [statsData, setStatsData] = useState<StatsDto | null>(null);
  const [targetCalories, setTargetCalories] = useState(2500);
  const [isLoading, setIsLoading] = useState(true);
  
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const load = async () => {
        try {
            const bmr = await fetchBMR();
            setTargetCalories(bmr);

            const res = await apiClient.get('/api/Stats');
            setStatsData(res.data);
        } catch (e) {
            console.log("Błąd pobierania statystyk:", e);
        } finally {
            setIsLoading(false);
        }
    };
    load();
  }, []);

  const displayData = useMemo(() => {
      if (!statsData) return { cals: 0, p: 0, f: 0, c: 0 };

      const targetP = 150; 
      const targetF = 80;
      const targetC = 300;

      if (period === 'day') {

          const todayStr = new Date().toISOString().split('T')[0];
          
          const todayEntry = statsData.weeklySummary.find(d => d.date.startsWith(todayStr));
          
          return {
              cals: todayEntry?.totalCalories || 0,
              p: todayEntry?.totalProtein || 0,
              f: todayEntry?.totalFat || 0,
              c: todayEntry?.totalCarbs || 0,
              targetCals: targetCalories,
              targetP, targetF, targetC
          };
      } 
      else if (period === 'week') {
          const summary = statsData.weeklySummary;
          const count = summary.length || 1;
          
          const avgP = summary.reduce((acc, curr) => acc + curr.totalProtein, 0) / count;
          const avgF = summary.reduce((acc, curr) => acc + curr.totalFat, 0) / count;
          const avgC = summary.reduce((acc, curr) => acc + curr.totalCarbs, 0) / count;

          return {
              cals: statsData.averageDailyCaloriesWeek,
              p: avgP,
              f: avgF,
              c: avgC,
              targetCals: targetCalories,
              targetP, targetF, targetC
          };
      }
      else {
          return {
              cals: statsData.averageDailyCaloriesMonth,
              p: 0,
              f: 0,
              c: 0,
              targetCals: targetCalories,
              targetP, targetF, targetC
          };
      }
  }, [statsData, period, targetCalories]);

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full border border-brand-accent">
          <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
        </TouchableOpacity>
        <Text className="text-brand-text text-2xl font-bold">Statystyki</Text>
      </View>

      <View className="flex-row mx-5 mb-6 bg-brand-card p-1 rounded-xl border border-brand-accent">
          {['day', 'week', 'month'].map((p) => {
              const isActive = period === p;
              const labels: any = { day: 'Dziś', week: 'Tydzień', month: 'Miesiąc' };
              return (
                  <TouchableOpacity 
                      key={p} 
                      onPress={() => setPeriod(p as any)}
                      className={`flex-1 py-2 rounded-lg items-center ${isActive ? 'bg-brand-primary' : ''}`}
                  >
                      <Text className={`font-bold ${isActive ? 'text-white' : 'text-brand-muted'}`}>
                          {labels[p]}
                      </Text>
                  </TouchableOpacity>
              );
          })}
      </View>

      {isLoading ? (
          <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#E0AAFF" />
          </View>
      ) : (
          <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
              
              <View className="bg-brand-card p-6 rounded-3xl border border-brand-accent mb-6 items-center shadow-lg shadow-brand-primary/20">
                  <Text className="text-brand-muted text-xs uppercase font-bold tracking-widest mb-2">
                      {period === 'day' ? 'Spożycie Dziś' : 'Średnia Spożycia'}
                  </Text>
                  
                  <Text className="text-6xl font-black text-white mb-1 tracking-tighter">
                      {displayData.cals?.toFixed(0)}
                  </Text>
                  
                  <View className="bg-brand-dark/50 px-4 py-1 rounded-full border border-brand-accent/30">
                    <Text className="text-brand-muted text-sm">
                        Cel: <Text className="text-brand-vivid font-bold">{displayData.targetCals?.toFixed(0)}</Text> kcal
                    </Text>
                  </View>
              </View>

              <View className="bg-brand-card p-6 rounded-3xl border border-brand-accent mb-6">
                  <Text className="text-white text-xl font-bold mb-6">
                      {period === 'month' ? 'Makro (Brak danych miesięcznych)' : 'Makroskładniki'}
                  </Text>
                  
                  {period !== 'month' && (
                      <>
                        <ProgressBar label="Białko" value={displayData.p} max={displayData.targetP} color="#3B82F6" />
                        <ProgressBar label="Tłuszcze" value={displayData.f} max={displayData.targetF} color="#EAB308" />
                        <ProgressBar label="Węglowodany" value={displayData.c} max={displayData.targetC} color="#10B981" />
                      </>
                  )}
                  {period === 'month' && <Text className="text-brand-muted text-center italic">Szczegółowe dane makro dostępne w widoku tygodniowym.</Text>}
              </View>

              {statsData?.currentWeight && (
                 <View className="flex-row gap-4 mb-10">
                    <View className="flex-1 bg-brand-card p-5 rounded-3xl border border-brand-accent items-center">
                        <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mb-2">
                            <Ionicons name="scale" size={28} color="#60A5FA" />
                        </View>
                        <Text className="text-3xl font-bold text-white">{statsData.currentWeight} kg</Text>
                        <Text className="text-brand-muted text-xs font-bold uppercase">Aktualna waga</Text>
                    </View>
                 </View>
              )}

          </ScrollView>
      )}
    </View>
  );
}