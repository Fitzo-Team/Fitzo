import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFood, MealType, FoodItem } from '../../Context/FoodContext';

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addFood, scannedCode, setScannedCode, productHistory } = useFood();
  
  const initialMeal = (params.initialMeal as MealType) || 'Breakfast';
  const autoScan = params.startScanning === 'true';

  const [activeTab, setActiveTab] = useState<'product' | 'recipe'>('product');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);

  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const [recipeName, setRecipeName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<FoodItem[]>([]);

  const [isScannerOpen, setIsScannerOpen] = useState(autoScan);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (scannedCode) {
      setFoodName(`Produkt (Kod: ${scannedCode})`);
      setCalories('250');

      setProtein('10'); setFat('5'); setCarbs('30');
      
      setIsScannerOpen(false);
      setActiveTab('product');
    }
  }, [scannedCode]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scannedCode) setScannedCode(data);
  };

  const handleSaveProduct = () => {
    if (!foodName || !calories) return;
    addFood('2023-10-27', selectedMeal, {
      name: foodName,
      calories: parseInt(calories),
      protein: protein ? parseInt(protein) : 0,
      fat: fat ? parseInt(fat) : 0,
      carbs: carbs ? parseInt(carbs) : 0,
      barcode: scannedCode || undefined
    });
    setScannedCode(null);
    router.back();
  };

  const handleSaveRecipe = () => {
    if (!recipeName || selectedIngredients.length === 0) return;

    const totalCals = selectedIngredients.reduce((acc, curr) => acc + curr.calories, 0);
    const totalProt = selectedIngredients.reduce((acc, curr) => acc + (curr.protein || 0), 0);
    const totalFat = selectedIngredients.reduce((acc, curr) => acc + (curr.fat || 0), 0);
    const totalCarbs = selectedIngredients.reduce((acc, curr) => acc + (curr.carbs || 0), 0);

    addFood('2023-10-27', selectedMeal, {
      name: `Przepis: ${recipeName}`,
      calories: totalCals,
      protein: totalProt,
      fat: totalFat,
      carbs: totalCarbs,
    });
    router.back();
  };

  const toggleIngredient = (item: FoodItem) => {
    if (selectedIngredients.find(i => i.id === item.id)) {
      setSelectedIngredients(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedIngredients(prev => [...prev, item]);
    }
  };

  if (isScannerOpen) {
    if (hasPermission === null) return <View className="flex-1 bg-brand-dark justify-center items-center"><Text className="text-brand-text">Proszę czekać...</Text></View>;
    if (hasPermission === false) return <View className="flex-1 bg-brand-dark justify-center items-center"><Text className="text-brand-text">Brak dostępu do kamery</Text></View>;
    
    return (
      <View className="flex-1 bg-black">
        <CameraView onBarcodeScanned={scannedCode ? undefined : handleBarcodeScanned} className="flex-1" />
        <TouchableOpacity className="absolute top-12 right-5 z-10 p-2 bg-brand-dark/60 rounded-full" onPress={() => setIsScannerOpen(false)}>
          <Ionicons name="close" size={30} color="#E0AAFF" />
        </TouchableOpacity>
        <View className="absolute inset-0 justify-center items-center pointer-events-none">
             <View className="w-64 h-48 border-2 border-brand-vivid rounded-2xl opacity-80" />
        </View>
        <View className="absolute bottom-24 w-full items-center">
          <Text className="text-brand-text bg-brand-dark/80 px-4 py-2 rounded-lg font-medium">Nakieruj na kod</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-dark pt-12">

      <View className="px-5 flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
        </TouchableOpacity>
        <Text className="text-brand-text text-2xl font-bold">Dodaj</Text>
      </View>

      <View className="flex-row mx-5 mb-6 bg-brand-card rounded-xl p-1 border border-brand-accent">
        <TouchableOpacity 
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'product' ? 'bg-brand-primary' : 'bg-transparent'}`}
          onPress={() => setActiveTab('product')}
        >
          <Text className={`font-bold ${activeTab === 'product' ? 'text-white' : 'text-brand-muted'}`}>Produkt</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'recipe' ? 'bg-brand-primary' : 'bg-transparent'}`}
          onPress={() => setActiveTab('recipe')}
        >
          <Text className={`font-bold ${activeTab === 'recipe' ? 'text-white' : 'text-brand-muted'}`}>Przepis</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between px-5 mb-6">
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((meal) => {
          const isSelected = selectedMeal === meal;
          const labels: Record<string, string> = { 'Breakfast': 'Śniad.', 'Lunch': 'Obiad', 'Dinner': 'Kolacja', 'Snack': 'Przek.' };
          return (
            <TouchableOpacity 
              key={meal} 
              onPress={() => setSelectedMeal(meal)}
              className={`px-3 py-2 rounded-full border ${isSelected ? 'bg-brand-vivid border-brand-vivid' : 'bg-brand-card border-brand-accent'}`}
            >
              <Text className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-brand-muted'}`}>{labels[meal]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>

        {activeTab === 'product' && (
          <View className="space-y-4 pb-10">
            <View className="flex-row gap-3 mb-2">
                <TouchableOpacity 
                  className="flex-1 bg-brand-card border border-brand-primary p-4 rounded-xl items-center justify-center"
                  onPress={() => { setScannedCode(null); setIsScannerOpen(true); }}
                >
                  <Ionicons name="barcode-outline" size={24} color="#9D4EDD" />
                  <Text className="text-brand-light font-semibold mt-1 text-xs">Skanuj kod</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-brand-card border border-brand-accent p-4 rounded-xl items-center justify-center">
                   <Ionicons name="search" size={24} color="#C77DFF" />
                   <Text className="text-brand-muted font-semibold mt-1 text-xs">Szukaj online</Text>
                </TouchableOpacity>
            </View>

            <View>
              <Text className="text-brand-muted mb-2 ml-1">Nazwa produktu</Text>
              <TextInput 
                className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent"
                placeholder="np. Pierś z kurczaka" placeholderTextColor="#C77DFF"
                value={foodName} onChangeText={setFoodName}
              />
            </View>

            <View>
              <Text className="text-brand-muted mb-2 ml-1">Kalorie (kcal)</Text>
              <TextInput 
                className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent"
                placeholder="0" placeholderTextColor="#C77DFF" keyboardType="numeric"
                value={calories} onChangeText={setCalories}
              />
            </View>

            <Text className="text-brand-muted mt-2 ml-1 text-sm font-bold">Makroskładniki (opcjonalne)</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">Białko (g)</Text>
                <TextInput 
                  className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center"
                  placeholder="0" placeholderTextColor="#666" keyboardType="numeric"
                  value={protein} onChangeText={setProtein}
                />
              </View>
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">Tłuszcz (g)</Text>
                <TextInput 
                  className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center"
                  placeholder="0" placeholderTextColor="#666" keyboardType="numeric"
                  value={fat} onChangeText={setFat}
                />
              </View>
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">Węgle (g)</Text>
                <TextInput 
                  className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center"
                  placeholder="0" placeholderTextColor="#666" keyboardType="numeric"
                  value={carbs} onChangeText={setCarbs}
                />
              </View>
            </View>

            <TouchableOpacity 
              className="mt-8 bg-brand-primary p-4 rounded-xl items-center shadow-lg active:bg-brand-vivid"
              onPress={handleSaveProduct}
            >
              <Text className="text-brand-text font-bold text-lg">Dodaj produkt</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'recipe' && (
          <View className="pb-10">
            <View className="mb-4">
              <Text className="text-brand-muted mb-2 ml-1">Nazwa przepisu</Text>
              <TextInput 
                className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent"
                placeholder="np. Moja Owsianka" placeholderTextColor="#C77DFF"
                value={recipeName} onChangeText={setRecipeName}
              />
            </View>

            <Text className="text-brand-muted mb-2 ml-1 font-bold">Wybierz składniki z historii:</Text>
            
            {productHistory.length === 0 ? (
               <View className="p-6 bg-brand-card rounded-xl border border-dashed border-brand-accent items-center">
                  <Text className="text-brand-muted text-center">Brak produktów w historii.{'\n'}Dodaj najpierw pojedyncze produkty.</Text>
               </View>
            ) : (
               <View className="bg-brand-card rounded-xl border border-brand-accent overflow-hidden">
                 {productHistory.map((item, index) => {
                    const isSelected = selectedIngredients.some(i => i.id === item.id);
                    return (
                      <TouchableOpacity 
                        key={`${item.id}_${index}`}
                        onPress={() => toggleIngredient(item)}
                        className={`p-4 flex-row justify-between items-center border-b border-brand-dark ${isSelected ? 'bg-brand-primary/20' : ''}`}
                      >
                        <View className="flex-1">
                          <Text className={`font-medium ${isSelected ? 'text-brand-text' : 'text-gray-400'}`}>{item.name}</Text>
                          <Text className="text-xs text-brand-muted">{item.calories} kcal</Text>
                        </View>
                        <View className={`w-6 h-6 rounded-full border items-center justify-center ${isSelected ? 'bg-brand-vivid border-brand-vivid' : 'border-brand-muted'}`}>
                           {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                      </TouchableOpacity>
                    )
                 })}
               </View>
            )}

            {selectedIngredients.length > 0 && (
                <View className="mt-6 bg-brand-card p-4 rounded-xl border border-brand-accent">
                   <Text className="text-brand-text text-center font-bold">Podsumowanie</Text>
                   <View className="flex-row justify-around mt-2">
                      <Text className="text-brand-muted">Kcal: <Text className="text-brand-text font-bold">{selectedIngredients.reduce((a,b)=>a+b.calories,0)}</Text></Text>
                      <Text className="text-brand-muted">B: <Text className="text-brand-text font-bold">{selectedIngredients.reduce((a,b)=>a+(b.protein||0),0)}</Text></Text>
                      <Text className="text-brand-muted">T: <Text className="text-brand-text font-bold">{selectedIngredients.reduce((a,b)=>a+(b.fat||0),0)}</Text></Text>
                      <Text className="text-brand-muted">W: <Text className="text-brand-text font-bold">{selectedIngredients.reduce((a,b)=>a+(b.carbs||0),0)}</Text></Text>
                   </View>
                </View>
            )}

            <TouchableOpacity 
              className={`mt-6 p-4 rounded-xl items-center shadow-lg ${selectedIngredients.length > 0 ? 'bg-brand-primary' : 'bg-brand-card opacity-50'}`}
              onPress={handleSaveRecipe}
              disabled={selectedIngredients.length === 0}
            >
              <Text className="text-brand-text font-bold text-lg">Zapisz przepis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}