import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, BmrFormula } from '../../Context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { bmrFormula, setBmrFormula } = useAuth();

  const formulas: { id: BmrFormula, name: string, desc: string }[] = [
      { 
          id: 'MifflinStJeor', 
          name: 'Wzór Mifflina-St Jeora', 
          desc: 'Zalecany. Najdokładniejszy dla współczesnej populacji.' 
      },
      { 
          id: 'HarrisBenedict', 
          name: 'Wzór Harrisa-Benedicta', 
          desc: 'Klasyczny wzór z 1919r. Może lekko zawyżać zapotrzebowanie.' 
      }
  ];

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full border border-brand-accent">
          <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
        </TouchableOpacity>
        <Text className="text-brand-text text-2xl font-bold">Ustawienia</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          
          <Text className="text-brand-muted font-bold mb-3 ml-2 uppercase text-xs tracking-wider">Kalkulacja Kalorii (BMR)</Text>
          <View className="bg-brand-card rounded-2xl border border-brand-accent overflow-hidden mb-8">
              {formulas.map((item, index) => {
                  const isSelected = bmrFormula === item.id;
                  return (
                      <TouchableOpacity 
                          key={item.id} 
                          onPress={() => setBmrFormula(item.id)}
                          className={`p-5 flex-row items-start ${index < formulas.length -1 ? 'border-b border-brand-dark' : ''} ${isSelected ? 'bg-brand-primary/10' : ''}`}
                      >
                          <View className={`w-6 h-6 rounded-full border mr-4 items-center justify-center ${isSelected ? 'border-brand-vivid bg-brand-vivid' : 'border-brand-muted'}`}>
                              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                          </View>
                          <View className="flex-1">
                              <Text className={`font-bold text-base ${isSelected ? 'text-white' : 'text-brand-text'}`}>{item.name}</Text>
                              <Text className="text-brand-muted text-xs mt-1 leading-5">{item.desc}</Text>
                          </View>
                      </TouchableOpacity>
                  )
              })}
          </View>

          <Text className="text-brand-muted font-bold mb-3 ml-2 uppercase text-xs tracking-wider">Informacje</Text>
          <View className="bg-brand-card rounded-2xl border border-brand-accent overflow-hidden">
              <TouchableOpacity className="p-5 flex-row justify-between items-center border-b border-brand-dark">
                  <Text className="text-brand-text">Wersja aplikacji</Text>
                  <Text className="text-brand-muted">1.0.2 Beta</Text>
              </TouchableOpacity>
              <TouchableOpacity className="p-5 flex-row justify-between items-center">
                  <Text className="text-brand-text">Język</Text>
                  <Text className="text-brand-muted">Polski</Text>
              </TouchableOpacity>
          </View>

      </ScrollView>
    </View>
  );
}