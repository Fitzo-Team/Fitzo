import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal, Keyboard, Image } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../../Context/FoodContext';
import { MealType, FoodItem, ProductDto, Recipe } from '../../Types/Api';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../Services/ImageService';
import apiClient from '../../Services/ApiClient';

const ALL_MEAL_TYPES: MealType[] = [
  MealType.Breakfast, MealType.SecondBreakfast, MealType.Lunch, 
  MealType.Dinner, MealType.Snack, MealType.Supper
];

const MEAL_LABELS: Record<string, string> = {
  [MealType.Breakfast]: 'Śniadanie', [MealType.SecondBreakfast]: 'II Śniad.',
  [MealType.Lunch]: 'Obiad', [MealType.Dinner]: 'Kolacja',
  [MealType.Snack]: 'Przekąska', [MealType.Supper]: 'Kolacja (Późna)'
};

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { 
    addFood, addRecipeToDiary, recipes, fetchRecipes,
    scannedCode, setScannedCode, productHistory, searchProduct, 
    searchProductsApi, searchResults, isLoading,
    addToHistory
  } = useFood();
  
  const initialMeal = (params.initialMeal as MealType) || MealType.Breakfast;
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
  const [recipeImage, setRecipeImage] = useState<string | null>(null);

  const [selectedRecipeToAdd, setSelectedRecipeToAdd] = useState<Recipe | null>(null);
  const [recipePortions, setRecipePortions] = useState('1');

  const [isScannerOpen, setIsScannerOpen] = useState(autoScan);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedLock, setScannedLock] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    fetchRecipes();
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
      const itemToHistory: FoodItem = {
          ...product,
          id: product.externalId || Math.random().toString(),
          name: product.name || "Bez nazwy"
      };
      addToHistory(itemToHistory);

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
      
      console.log(`[UI] Szukam: ${searchQuery}`);
      const results = await searchProductsApi(searchQuery);
      console.log(`[UI] Pobranno wyników: ${results.length}`);
      
      setApiResults(results);
      setShowSearchList(true);
      Keyboard.dismiss(); 
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

  const toggleIngredient = (item: FoodItem) => {
    if (selectedIngredients.find(i => i.id === item.id)) {
      setSelectedIngredients(prev => prev.filter(i => i.id !== item.id));
    } else {
      const newItem = { ...item, amount: 100 }; 
      setSelectedIngredients(prev => [...prev, newItem]);
    }
  };

  const updateIngredientAmount = (id: string, text: string) => {
      const newAmount = parseFloat(text);
      if (isNaN(newAmount)) return;
      setSelectedIngredients(prev => prev.map(item => item.id === id ? { ...item, amount: newAmount } : item));
  };

  const recipeTotals = useMemo(() => {
      return selectedIngredients.reduce((acc, item) => {
          const factor = (item.amount || 100) / 100;
          return {
              kcal: acc.kcal + (item.calories || 0) * factor,
              p: acc.p + (item.protein || 0) * factor,
              f: acc.f + (item.fat || 0) * factor,
              c: acc.c + (item.carbs || 0) * factor,
          };
      }, { kcal: 0, p: 0, f: 0, c: 0 });
  }, [selectedIngredients]);

  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
      });

      if (!result.canceled) {
          setRecipeImage(result.assets[0].uri);
      }
  };

  const handleSaveRecipe = async () => {
    if (!recipeName || selectedIngredients.length === 0) {
        Alert.alert("Błąd", "Podaj nazwę i dodaj składniki");
        return;
    }

    try {
        const ingredientsDto = selectedIngredients.map(item => ({
            amount: Number(item.amount) || 100,
            product: {
                name: item.name || "Składnik",
                calories: Number(item.calories) || 0,
                protein: Number(item.protein) || 0,
                fat: Number(item.fat) || 0,
                carbs: Number(item.carbs) || 0,
                servingUnit: "g",
                servingSize: 100,
                brand: item.brand || "",
                imageUrl: item.imageUrl || "",
                externalId: item.externalId || undefined
            }
        }));

        const res = await apiClient.post('/api/Recipes', { 
            name: recipeName, 
            ingredients: ingredientsDto, 
            tags: [] 
        });
        
        const createdRecipeId = res.data?.id; 

        if (createdRecipeId && recipeImage) {
            await uploadImage(`/api/Recipes/${createdRecipeId}/image`, recipeImage);
        }

        Alert.alert("Sukces", "Przepis utworzony!");

        setRecipeName('');
        setSelectedIngredients([]);
        setRecipeImage(null);
        fetchRecipes();

    } catch (e: any) {
        console.error(e);
        Alert.alert("Błąd", "Nie udało się zapisać przepisu");
    }
  };

  const openRecipeModal = (recipe: Recipe) => {
      setSelectedRecipeToAdd(recipe);
      setRecipePortions('1');
  };

  const confirmAddRecipe = async () => {
      if (!selectedRecipeToAdd) return;
      const portions = parseFloat(recipePortions.replace(',', '.'));
      if (isNaN(portions) || portions <= 0) {
          Alert.alert("Błąd", "Podaj poprawną ilość porcji");
          return;
      }
      await addRecipeToDiary(targetDate, selectedMeal, selectedRecipeToAdd, portions);
      setSelectedRecipeToAdd(null);
      router.navigate('/(tabs)/journal');
  };

  if (isScannerOpen) {
    if (hasPermission === null) return <View className="flex-1 bg-brand-dark justify-center items-center"><Text className="text-brand-text">Proszę czekać...</Text></View>;
    if (hasPermission === false) return <View className="flex-1 bg-brand-dark justify-center items-center"><Text className="text-brand-text">Brak dostępu do kamery.</Text></View>;
    
    return (
      <View className="flex-1 bg-black relative">
        <CameraView facing="back" onBarcodeScanned={scannedLock ? undefined : handleBarcodeScanned} style={{ flex: 1 }} />
        <TouchableOpacity className="absolute top-12 right-5 z-20 p-2 bg-brand-dark/60 rounded-full" onPress={() => { setIsScannerOpen(false); setScannedLock(false); }}>
          <Ionicons name="close" size={30} color="#E0AAFF" />
        </TouchableOpacity>
        <View className="absolute bottom-24 w-full items-center z-10">
          <Text className="text-brand-text bg-brand-dark/80 px-4 py-2 rounded-lg font-medium">Nakieruj kamerę na kod kreskowy</Text>
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

      <View className="flex-row mx-5 mb-4 bg-brand-card rounded-xl p-1 border border-brand-accent">
        <TouchableOpacity onPress={() => setActiveTab('product')} className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'product' ? 'bg-brand-primary' : 'bg-transparent'}`}>
          <Text className={`font-bold ${activeTab === 'product' ? 'text-white' : 'text-brand-muted'}`}>Produkt</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('recipe')} className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'recipe' ? 'bg-brand-primary' : 'bg-transparent'}`}>
          <Text className={`font-bold ${activeTab === 'recipe' ? 'text-white' : 'text-brand-muted'}`}>Przepis</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {ALL_MEAL_TYPES.map((meal) => {
            const isSelected = selectedMeal === meal;
            return (
                <TouchableOpacity key={meal} onPress={() => setSelectedMeal(meal)} className={`px-4 py-2 rounded-full border mr-2 ${isSelected ? 'bg-brand-vivid border-brand-vivid' : 'bg-brand-card border-brand-accent'}`}>
                <Text className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-brand-muted'}`}>{MEAL_LABELS[meal] || meal}</Text>
                </TouchableOpacity>
            );
            })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {activeTab === 'product' && (
          <View className="space-y-4 pb-10">
            <View className="flex-row gap-2 mb-2">
                <TextInput 
                    className="flex-1 bg-brand-card text-white p-4 rounded-xl border border-brand-accent" 
                    placeholder="Szukaj produktu..." placeholderTextColor="#666" 
                    value={searchQuery} onChangeText={setSearchQuery} 
                    onSubmitEditing={handleSearchApi} 
                />
                <TouchableOpacity onPress={handleSearchApi} className="bg-brand-primary justify-center px-4 rounded-xl"><Ionicons name="search" size={24} color="white" /></TouchableOpacity>
                <TouchableOpacity onPress={() => { setScannedCode(null); setScannedLock(false); setIsScannerOpen(true); }} className="bg-brand-card border border-brand-primary justify-center px-4 rounded-xl"><Ionicons name="barcode-outline" size={24} color="#9D4EDD" /></TouchableOpacity>
            </View>

            {showSearchList && apiResults.length > 0 && (
                <View className="bg-brand-card rounded-xl border border-brand-accent mb-4 overflow-hidden">
                    <View className="bg-brand-primary px-4 py-2">
                        <Text className="text-white font-bold text-xs">Wyniki wyszukiwania ({apiResults.length})</Text>
                    </View>
                    {apiResults.map((item, index) => (
                        <TouchableOpacity 
                            key={index} 
                            className="p-3 border-b border-brand-dark flex-row justify-between items-center" 
                            onPress={() => goToDetails(item)}
                        >
                            <View className="flex-1 mr-2">
                                <Text className="text-white font-bold" numberOfLines={1}>{item.name || "Produkt bez nazwy"}</Text>
                                <Text className="text-brand-muted text-xs">{item.calories} kcal • {item.brand || "Brak marki"}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#E0AAFF" />
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => setShowSearchList(false)} className="p-3 items-center bg-brand-dark">
                        <Text className="text-brand-muted text-xs font-bold uppercase">Zamknij listę</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text className="text-brand-text mb-2 ml-1 font-bold">Ostatnio używane:</Text>
            <View className="bg-brand-card rounded-xl border border-brand-accent overflow-hidden mb-4">
                 {productHistory.slice(0, 10).map((item, index) => (
                      <TouchableOpacity key={`${item.id}_${index}`} onPress={() => goToDetails(item)} className="p-4 flex-row justify-between items-center border-b border-brand-dark">
                        <Text className="font-medium flex-1 text-brand-text">{item.name}</Text>
                        <Ionicons name="add-circle-outline" size={24} color="#E0AAFF" />
                      </TouchableOpacity>
                 ))}
                 {productHistory.length === 0 && <Text className="p-4 text-brand-muted text-center">Brak historii</Text>}
            </View>

            <Text className="text-brand-muted text-center my-2">Lub dodaj ręcznie:</Text>
            <View><Text className="text-brand-muted mb-2 ml-1">Nazwa produktu</Text><TextInput className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent" placeholder="np. Banan" placeholderTextColor="#C77DFF" value={foodName} onChangeText={setFoodName}/></View>
            <View><Text className="text-brand-muted mb-2 ml-1">Kalorie (kcal)</Text><TextInput className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent" placeholder="0" placeholderTextColor="#C77DFF" keyboardType="numeric" value={calories} onChangeText={setCalories}/></View>
            
            <Text className="text-brand-text mt-2 ml-1 text-sm font-bold">Makroskładniki (opcjonalne)</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">B (g)</Text>
                <TextInput className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center" placeholder="0" placeholderTextColor="#666" keyboardType="numeric" value={protein} onChangeText={setProtein}/>
              </View>
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">T (g)</Text>
                <TextInput className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center" placeholder="0" placeholderTextColor="#666" keyboardType="numeric" value={fat} onChangeText={setFat}/>
              </View>
              <View className="flex-1">
                <Text className="text-brand-muted text-xs mb-1 ml-1">W (g)</Text>
                <TextInput className="bg-brand-card text-brand-text p-3 rounded-xl border border-brand-accent text-center" placeholder="0" placeholderTextColor="#666" keyboardType="numeric" value={carbs} onChangeText={setCarbs}/>
              </View>
            </View>

            <TouchableOpacity className="mt-8 bg-brand-primary p-4 rounded-xl items-center shadow-lg" onPress={handleSaveProduct} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-brand-text font-bold text-lg">Dodaj własny produkt</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'recipe' && (
          <View className="pb-20">
            <View className="mb-8">
                <Text className="text-brand-text text-xl font-bold mb-4">Utwórz nowy</Text>
                
                <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-brand-card rounded-2xl border border-dashed border-brand-accent mb-4 items-center justify-center overflow-hidden">
                    {recipeImage ? (
                        <Image source={{ uri: recipeImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="items-center">
                            <Ionicons name="camera-outline" size={40} color="#E0AAFF" />
                            <Text className="text-brand-muted mt-2">Dodaj zdjęcie (opcjonalne)</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TextInput className="bg-brand-card text-brand-text p-4 rounded-xl text-base border border-brand-accent mb-4" placeholder="np. Moja Owsianka" placeholderTextColor="#C77DFF" value={recipeName} onChangeText={setRecipeName}/>
                
                <View className="bg-brand-primary/20 p-4 rounded-2xl border border-brand-primary mb-4">
                    <Text className="text-brand-text font-bold text-center mb-2">Podsumowanie (na porcję)</Text>
                    <View className="flex-row justify-around">
                        <View className="items-center"><Text className="text-white font-bold text-xl">{recipeTotals.kcal.toFixed(0)}</Text><Text className="text-brand-muted text-xs">kcal</Text></View>
                        <View className="items-center"><Text className="text-white font-bold text-lg">{recipeTotals.p.toFixed(1)}</Text><Text className="text-brand-muted text-xs">B</Text></View>
                        <View className="items-center"><Text className="text-white font-bold text-lg">{recipeTotals.f.toFixed(1)}</Text><Text className="text-brand-muted text-xs">T</Text></View>
                        <View className="items-center"><Text className="text-white font-bold text-lg">{recipeTotals.c.toFixed(1)}</Text><Text className="text-brand-muted text-xs">W</Text></View>
                    </View>
                </View>

                <Text className="text-brand-text mb-2 ml-1 font-bold">Wybierz składniki z historii:</Text>
                <View className="bg-brand-card rounded-xl border border-brand-accent overflow-hidden mt-2 max-h-80">
                    <ScrollView nestedScrollEnabled>
                        {productHistory.slice(0, 15).map((item, index) => {
                            const selectedItem = selectedIngredients.find(i => i.id === item.id);
                            const isSelected = !!selectedItem;
                            return (
                            <View key={`${item.id}_${index}`} className={`border-b border-brand-dark ${isSelected ? 'bg-brand-primary/10' : ''}`}>
                                <TouchableOpacity onPress={() => toggleIngredient(item)} className="p-4 flex-row justify-between items-center">
                                    <View className="flex-1"><Text className={`font-medium ${isSelected ? 'text-brand-text' : 'text-gray-400'}`}>{item.name}</Text></View>
                                    {isSelected ? <Ionicons name="checkmark-circle" size={24} color="#E0AAFF" /> : <Ionicons name="add-circle-outline" size={24} color="#666" />}
                                </TouchableOpacity>
                                {isSelected && (
                                    <View className="px-4 pb-4 flex-row items-center justify-end gap-3">
                                        <Text className="text-brand-muted text-sm">Ilość:</Text>
                                        <TextInput className="bg-brand-dark text-white p-2 rounded-lg w-20 text-center border border-brand-accent font-bold" keyboardType="numeric" placeholder="100" placeholderTextColor="#666" value={selectedItem?.amount?.toString()} onChangeText={(text) => item.id && updateIngredientAmount(item.id, text)}/>
                                        <Text className="text-brand-text text-sm">g</Text>
                                    </View>
                                )}
                            </View>
                            )
                        })}
                    </ScrollView>
                </View>

                <TouchableOpacity className={`mt-4 p-4 rounded-xl items-center shadow-lg ${selectedIngredients.length > 0 ? 'bg-brand-primary' : 'bg-brand-card opacity-50'}`} onPress={handleSaveRecipe} disabled={selectedIngredients.length === 0 || isLoading}>
                  {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-brand-text font-bold text-lg">Utwórz i Zapisz</Text>}
                </TouchableOpacity>
            </View>

            <View>
                <Text className="text-brand-text text-xl font-bold mb-4">Twoje Przepisy</Text>
                {recipes.length === 0 ? <Text className="text-brand-muted text-center p-4">Brak zapisanych przepisów</Text> : recipes.map((recipe, index) => (
                    <TouchableOpacity key={`${recipe.id}_${index}`} onPress={() => openRecipeModal(recipe)} className="bg-brand-card p-4 mb-3 rounded-2xl border border-brand-accent flex-row items-center">
                        <View className="w-16 h-16 bg-brand-dark rounded-xl mr-4 overflow-hidden border border-brand-accent/30">
                            {recipe.imageUrl ? (
                                <Image source={{ uri: recipe.imageUrl }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="w-full h-full items-center justify-center"><Ionicons name="restaurant" size={20} color="#666" /></View>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-brand-text font-bold text-lg">{recipe.name}</Text>
                            <Text className="text-brand-muted text-xs">Kliknij, aby dodać do dziennika</Text>
                        </View>
                        <Ionicons name="add-circle" size={32} color="#E0AAFF" />
                    </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedRecipeToAdd} transparent animationType="slide">
          <View className="flex-1 bg-black/80 justify-center items-center px-6">
              <View className="bg-brand-card w-full p-6 rounded-3xl border border-brand-accent">
                  <Text className="text-brand-text text-xl font-bold text-center mb-2">{selectedRecipeToAdd?.name}</Text>
                  <Text className="text-brand-muted text-center mb-6">Ile porcji chcesz dodać?</Text>
                  
                  <View className="flex-row items-center justify-center gap-4 mb-8">
                      <TouchableOpacity onPress={() => setRecipePortions(p => Math.max(0.5, parseFloat(p) - 0.5).toString())} className="bg-brand-dark p-3 rounded-xl border border-brand-accent">
                          <Ionicons name="remove" size={24} color="#E0AAFF" />
                      </TouchableOpacity>
                      <TextInput className="bg-brand-dark text-white text-2xl font-bold p-4 rounded-2xl w-24 text-center border border-brand-primary" keyboardType="numeric" value={recipePortions} onChangeText={setRecipePortions} />
                      <TouchableOpacity onPress={() => setRecipePortions(p => (parseFloat(p) + 0.5).toString())} className="bg-brand-dark p-3 rounded-xl border border-brand-accent">
                          <Ionicons name="add" size={24} color="#E0AAFF" />
                      </TouchableOpacity>
                  </View>
                  <View className="flex-row gap-4">
                      <TouchableOpacity onPress={() => setSelectedRecipeToAdd(null)} className="flex-1 bg-brand-dark py-4 rounded-xl items-center border border-brand-muted/30"><Text className="text-brand-muted font-bold">Anuluj</Text></TouchableOpacity>
                      <TouchableOpacity onPress={confirmAddRecipe} className="flex-1 bg-brand-primary py-4 rounded-xl items-center"><Text className="text-brand-text font-bold">Dodaj</Text></TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

    </View>
  );
}