import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../../Context/FoodContext';
import { MealType, FoodItem, ProductDto } from '../../Types/Api';

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { 
    addFood, 
    createRecipe, 
    scannedCode, 
    setScannedCode, 
    productHistory, 
    searchProduct, 
    searchProductsApi, 
    searchResults, 
    isLoading 
  } = useFood();

  const initialMeal = (params.initialMeal as MealType) || 'Breakfast';
  const targetDate = params.date ? params.date.toString() : new Date().toISOString();
  
  const autoScan = params.startScanning === 'true';

  const [activeTab, setActiveTab] = useState<'product' | 'recipe'>('product');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);

  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState<ProductDto[]>([]);
  const [showSearchList, setShowSearchList] = useState(false);

  const [recipeName, setRecipeName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<FoodItem[]>([]);

  const [isScannerOpen, setIsScannerOpen] = useState(autoScan);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedLock, setScannedLock] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const handleScan = async () => {
        if (scannedCode) {
            setIsScannerOpen(false);
            setScannedLock(false);
            setActiveTab('product');
            await searchProduct(scannedCode);
        }
    };
    handleScan();
  }, [scannedCode]);

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
        const product = searchResults[0];
        goToDetails(product);
        setScannedCode(null); 
    }
  }, [searchResults]);

  const goToDetails = (product: ProductDto) => {
      router.push({
          pathname: '/product-details',
          params: {
              product: JSON.stringify(product),
              mealType: selectedMeal,
              date: targetDate
          }
      });
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scannedLock) {
        setScannedLock(true);
        setScannedCode(data);
    }
  };

  const handleSearchApi = async () => {
      if (searchQuery.length < 2) return;
      setShowSearchList(true);
      const results = await searchProductsApi(searchQuery);
      setApiResults(results);
  };

  const handleSaveProduct = async () => {
    if (!foodName || !calories) {
        Alert.alert("Wymagane dane", "Podaj nazwę i kalorie");
        return;
    }
    
    await addFood(targetDate, selectedMeal, {
      name: foodName,
      calories: parseFloat(calories),
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbs: parseFloat(carbs) || 0,
      barcode: undefined 
    });

    router.navigate('/(tabs)/journal');
  };

  const handleSaveRecipe = async () => {
    if (!recipeName || selectedIngredients.length === 0) {
        Alert.alert("Błąd", "Podaj nazwę i dodaj składniki");
        return;
    }
    await createRecipe(recipeName, selectedIngredients);
    router.navigate('/(tabs)/journal');
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
    if (hasPermission === false) return <View className="flex-1 bg-brand-dark justify-center items-center"><Text className="text-brand-text">Brak dostępu do kamery.</Text></View>;
    
    return (
      <View className="flex-1 bg-black relative">
        <CameraView
          facing="back"
          onBarcodeScanned={scannedLock ? undefined : handleBarcodeScanned}
          style={{ flex: 1 }}
        />
        <TouchableOpacity 
          className="absolute top-12 right-5 z-20 p-2 bg-brand-dark/60 rounded-full"
          onPress={() => { setIsScannerOpen(false); setScannedLock(false); }}
        >
          <Ionicons name="close" size={30} color="#E0AAFF" />
        </TouchableOpacity>
        <View className="absolute inset-0 justify-center items-center pointer-events-none z-10">
             <View className="w-64 h-48 border-2 border-brand-vivid rounded-2xl opacity-80" />
        </View>
        <View className="absolute bottom-24 w-full items-center z-10">
          <Text className="text-brand-text bg-brand-dark/80 px-4 py-2 rounded-lg font-medium overflow-hidden">
            Nakieruj kamerę na kod kreskowy
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      
      <View className="px-5 flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full border border-brand-accent">
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

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {activeTab === 'product' && (
          <View className="space-y-4 pb-10">
            
            <View className="flex-row gap-2 mb-2">
                <TextInput 
                    className="flex-1 bg-brand-card text-white p-4 rounded-xl border border-brand-accent"
                    placeholder="Szukaj produktu..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearchApi}
                />
                <TouchableOpacity onPress={handleSearchApi} className="bg-brand-primary justify-center px-4 rounded-xl">
                    <Ionicons name="search" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setScannedCode(null); setScannedLock(false); setIsScannerOpen(true); }} className="bg-brand-card border border-brand-primary justify-center px-4 rounded-xl">
                    <Ionicons name="barcode-outline" size={24} color="#9D4EDD" />
                </TouchableOpacity>
            </View>

            {showSearchList && apiResults.length > 0 && (
                <View className="bg-brand-card rounded-xl border border-brand-accent mb-4 max-h-60 overflow-hidden">
                    <ScrollView nestedScrollEnabled>
                        {apiResults.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                className="p-3 border-b border-brand-dark flex-row justify-between items-center"
                                onPress={() => goToDetails(item)}
                            >
                                <View>
                                    <Text className="text-white font-bold">{item.name}</Text>
                                    <Text className="text-brand-muted text-xs">{item.calories} kcal</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#E0AAFF" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setShowSearchList(false)} className="p-2 items-center bg-brand-dark">
                        <Text className="text-brand-muted text-xs">Zamknij listę</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text className="text-brand-text mb-2 ml-1 font-bold">Ostatnio używane:</Text>
            <View className="bg-brand-card rounded-xl border border-brand-accent overflow-hidden mb-4">
                 {productHistory.slice(0, 5).map((item, index) => (
                      <TouchableOpacity 
                        key={`${item.id}_${index}`}
                        onPress={() => goToDetails(item)}
                        className="p-4 flex-row justify-between items-center border-b border-brand-dark"
                      >
                        <Text className="font-medium flex-1 text-brand-text">{item.name}</Text>
                        <Ionicons name="add-circle-outline" size={24} color="#E0AAFF" />
                      </TouchableOpacity>
                 ))}
                 {productHistory.length === 0 && (
                     <Text className="p-4 text-brand-muted text-center">Brak historii</Text>
                 )}
            </View>

            <Text className="text-brand-muted text-center my-2">Lub dodaj ręcznie:</Text>
            <View>
              <Text className="text-brand-muted mb-2 ml-1">Nazwa produktu</Text>
              <TextInput 
                className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent"
                placeholder="np. Banan" placeholderTextColor="#C77DFF"
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

            <Text className="text-brand-text mt-2 ml-1 text-sm font-bold">Makroskładniki (opcjonalne)</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">B (g)</Text>
                <TextInput 
                  className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center"
                  placeholder="0" placeholderTextColor="#666" keyboardType="numeric"
                  value={protein} onChangeText={setProtein}
                />
              </View>
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">T (g)</Text>
                <TextInput 
                  className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center"
                  placeholder="0" placeholderTextColor="#666" keyboardType="numeric"
                  value={fat} onChangeText={setFat}
                />
              </View>
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">W (g)</Text>
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
              disabled={isLoading}
            >
              {isLoading ? (
                  <ActivityIndicator color="white" />
              ) : (
                  <Text className="text-brand-text font-bold text-lg">Dodaj własny produkt</Text>
              )}
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

            <Text className="text-brand-text mb-2 ml-1 font-bold">Wybierz składniki z historii:</Text>
            <View className="bg-brand-card rounded-xl border border-brand-accent overflow-hidden mt-2">
                 {productHistory.slice(0, 10).map((item, index) => {
                    const isSelected = selectedIngredients.some(i => i.id === item.id);
                    return (
                      <TouchableOpacity 
                        key={`${item.id}_${index}`}
                        onPress={() => toggleIngredient(item)}
                        className={`p-4 flex-row justify-between items-center border-b border-brand-dark ${isSelected ? 'bg-brand-primary/20' : ''}`}
                      >
                        <Text className={`font-medium flex-1 ${isSelected ? 'text-brand-text' : 'text-gray-400'}`}>{item.name}</Text>
                        {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                      </TouchableOpacity>
                    )
                 })}
            </View>

            <TouchableOpacity 
              className={`mt-6 p-4 rounded-xl items-center shadow-lg ${selectedIngredients.length > 0 ? 'bg-brand-primary' : 'bg-brand-card opacity-50'}`}
              onPress={handleSaveRecipe}
              disabled={selectedIngredients.length === 0 || isLoading}
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-brand-text font-bold text-lg">Zapisz przepis</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}