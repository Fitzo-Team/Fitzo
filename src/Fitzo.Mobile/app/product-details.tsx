import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../Context/FoodContext';
import { MealType, ProductDto } from '../Types/Api';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addFood } = useFood();

  const product: ProductDto | null = params.product ? JSON.parse(params.product as string) : null;
  const mealType = (params.mealType as MealType) || 'Breakfast';
  const date = (params.date as string) || new Date().toISOString();

  const [amount, setAmount] = useState('100');

  if (!product) return <View className="flex-1 bg-brand-dark justify-center items-center"><Text className="text-white">Błąd produktu</Text></View>;

  const handleAdd = async () => {
      const quantity = parseFloat(amount);
      if (!quantity || quantity <= 0) {
          Alert.alert("Błąd", "Podaj poprawną ilość");
          return;
      }

      await addFood(date, mealType, {
          ...product,
          amount: quantity,
          name: product.name || 'Produkt'
      });

      router.navigate('/(tabs)/journal');
  };

  const calc = (val: number) => ((val * parseFloat(amount || '0')) / 100).toFixed(1);

  return (
    <View className="flex-1 bg-brand-dark pt-12 px-5">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
            {product.imageUrl && (
                <Image source={{ uri: product.imageUrl }} className="w-32 h-32 rounded-full mb-4" />
            )}
            <Text className="text-white text-2xl font-bold text-center">{product.name}</Text>
            <Text className="text-brand-muted">{product.brand}</Text>
        </View>

        <View className="bg-brand-card p-6 rounded-3xl mb-6 border border-brand-accent">
            <Text className="text-brand-muted mb-2 text-center">Ile zjadłeś? (g/ml)</Text>
            <View className="flex-row justify-center items-center gap-4">
                <TouchableOpacity onPress={() => setAmount((p) => Math.max(0, parseFloat(p) - 10).toString())} className="bg-brand-dark p-3 rounded-full">
                    <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>
                <TextInput 
                    className="bg-brand-dark text-white text-2xl font-bold p-4 rounded-2xl w-32 text-center border border-brand-accent"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                <TouchableOpacity onPress={() => setAmount((p) => (parseFloat(p) + 10).toString())} className="bg-brand-dark p-3 rounded-full">
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>

        <View className="flex-row justify-between mb-8">
            <View className="bg-brand-card flex-1 p-4 rounded-2xl mr-2 items-center border border-brand-accent">
                <Text className="text-brand-vivid font-bold text-xl">{calc(product.calories)}</Text>
                <Text className="text-brand-muted text-xs">kcal</Text>
            </View>
            <View className="bg-brand-card flex-1 p-4 rounded-2xl mr-2 items-center border border-brand-accent">
                <Text className="text-blue-400 font-bold text-xl">{calc(product.protein)}</Text>
                <Text className="text-brand-muted text-xs">Białko</Text>
            </View>
            <View className="bg-brand-card flex-1 p-4 rounded-2xl mr-2 items-center border border-brand-accent">
                <Text className="text-green-400 font-bold text-xl">{calc(product.carbs)}</Text>
                <Text className="text-brand-muted text-xs">Węgle</Text>
            </View>
            <View className="bg-brand-card flex-1 p-4 rounded-2xl items-center border border-brand-accent">
                <Text className="text-yellow-400 font-bold text-xl">{calc(product.fat)}</Text>
                <Text className="text-brand-muted text-xs">Tłuszcz</Text>
            </View>
        </View>

        <TouchableOpacity 
            className="bg-brand-primary p-4 rounded-2xl items-center shadow-lg mb-10"
            onPress={handleAdd}
        >
            <Text className="text-brand-text font-bold text-lg">Dodaj do dziennika</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}