import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import apiClient, { API_BASE_URL } from '../../Services/ApiClient';
import { useAuth } from '../../Context/AuthContext';

interface RecipeListDto {
  id: string;
  name: string;
  imageUrl?: string;      
  thumbnailUrl?: string;  
  userId?: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

interface RecipeDetailDto extends RecipeListDto {
  ingredients?: {
      amount: number;
      product: {
          name: string;
          calories: number;
          protein: number;
          fat: number;
          carbs: number;
          servingUnit: string;
      }
  }[];
  description?: string;
}


const BLOB_CONTAINER = 'uploads'; 

const getRecipeImageSource = (item: RecipeListDto): string | undefined => {
    let urlToUse = item.thumbnailUrl || item.imageUrl;

    if (!urlToUse) return undefined;

    if (urlToUse.startsWith('/')) {
        const myIp = API_BASE_URL.split('://')[1].split(':')[0];
        return `http://${myIp}:10000/devstoreaccount1/${BLOB_CONTAINER}${urlToUse}`;
    }

    if (urlToUse.includes('127.0.0.1') || urlToUse.includes('localhost')) {
        const myIp = API_BASE_URL.split('://')[1].split(':')[0];
        return urlToUse.replace('127.0.0.1', myIp).replace('localhost', myIp);
    }

    return urlToUse;
};

const getFullRecipeImage = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    if (url.startsWith('/')) {
        const myIp = API_BASE_URL.split('://')[1].split(':')[0];
        return `http://${myIp}:10000/devstoreaccount1/${BLOB_CONTAINER}${url}`;
    }
    if (url.includes('127.0.0.1') || url.includes('localhost')) {
        const myIp = API_BASE_URL.split('://')[1].split(':')[0];
        return url.replace('127.0.0.1', myIp).replace('localhost', myIp);
    }
    return url;
};


const RecipeCard = ({ item, onPress }: { item: RecipeListDto, onPress: (id: string) => void }) => {
    const imageUrl = getRecipeImageSource(item);

    return (
      <TouchableOpacity 
        className="mr-4 w-48 bg-brand-card rounded-2xl overflow-hidden border border-brand-accent shadow-md"
        onPress={() => onPress(item.id)}
      >
        <View className="h-32 bg-brand-dark items-center justify-center relative border-b border-brand-dark">
            {imageUrl ? (
                <Image 
                    source={{ uri: imageUrl }} 
                    className="w-full h-full" 
                    resizeMode="cover"
                />
            ) : (
                <View className="items-center justify-center w-full h-full bg-brand-primary/20">
                    <MaterialCommunityIcons name="chef-hat" size={40} color="rgba(224, 170, 255, 0.5)" />
                </View>
            )}
        </View>
        
        <View className="p-3">
          <Text className="text-brand-text font-bold text-base mb-2 h-12" numberOfLines={2}>
              {item.name}
          </Text>
          
          <Text className="text-brand-vivid font-bold text-sm mb-2">
              {item.totalCalories?.toFixed(0) || 0} kcal
          </Text>

          <View className="flex-row justify-between pt-2 border-t border-brand-dark/50">
              <View className="items-center">
                  <Text className="text-brand-muted text-[10px] uppercase font-bold">B</Text>
                  <Text className="text-white text-xs font-medium">{item.totalProtein?.toFixed(0) || 0}</Text>
              </View>
              <View className="items-center">
                  <Text className="text-brand-muted text-[10px] uppercase font-bold">T</Text>
                  <Text className="text-white text-xs font-medium">{item.totalFat?.toFixed(0) || 0}</Text>
              </View>
              <View className="items-center">
                  <Text className="text-brand-muted text-[10px] uppercase font-bold">W</Text>
                  <Text className="text-white text-xs font-medium">{item.totalCarbs?.toFixed(0) || 0}</Text>
              </View>
          </View>
        </View>
      </TouchableOpacity>
    );
};

const RecipeDetailModal = ({ visible, recipeId, onClose }: { visible: boolean, recipeId: string | null, onClose: () => void }) => {
    const [details, setDetails] = useState<RecipeDetailDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible && recipeId) {
            loadDetails();
        } else {
            setDetails(null);
            setLoading(true);
        }
    }, [visible, recipeId]);

    const loadDetails = async () => {
        if (!recipeId) return;
        try {
            setLoading(true);
            const res = await apiClient.get(`/api/Recipes/${recipeId}`);
            setDetails(res.data);
        } catch (e) {
            console.error("Błąd pobierania szczegółów przepisu:", e);
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-brand-dark">
                <View className="absolute top-4 right-4 z-50">
                    <TouchableOpacity onPress={onClose} className="bg-black/50 p-2 rounded-full">
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#E0AAFF" />
                    </View>
                ) : details ? (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                        <View className="h-64 bg-brand-card w-full items-center justify-center relative">
                            {details.imageUrl ? (
                                <Image 
                                    source={{ uri: getFullRecipeImage(details.imageUrl) ?? undefined }} 
                                    className="w-full h-full" 
                                    resizeMode="cover"
                                />
                            ) : (
                                <MaterialCommunityIcons name="chef-hat" size={80} color="rgba(224, 170, 255, 0.3)" />
                            )}
                             <View className="absolute bottom-0 w-full bg-gradient-to-t from-brand-dark to-transparent h-20" />
                        </View>

                        <View className="px-5 -mt-10">
                            <Text className="text-white text-3xl font-bold mb-2 shadow-sm">{details.name}</Text>
                            
                            <View className="flex-row bg-brand-card p-4 rounded-2xl border border-brand-accent justify-around mb-6 shadow-lg">
                                <View className="items-center">
                                    <Text className="text-brand-vivid font-bold text-xl">{details.totalCalories?.toFixed(0)}</Text>
                                    <Text className="text-brand-muted text-xs uppercase">kcal</Text>
                                </View>
                                <View className="h-full w-[1px] bg-brand-dark" />
                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">{details.totalProtein?.toFixed(1)}g</Text>
                                    <Text className="text-brand-muted text-xs uppercase">Białko</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">{details.totalFat?.toFixed(1)}g</Text>
                                    <Text className="text-brand-muted text-xs uppercase">Tłuszcz</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-white font-bold text-lg">{details.totalCarbs?.toFixed(1)}g</Text>
                                    <Text className="text-brand-muted text-xs uppercase">Węgle</Text>
                                </View>
                            </View>

                            <Text className="text-white text-xl font-bold mb-3">Składniki</Text>
                            <View className="bg-brand-card rounded-2xl border border-brand-accent p-4 mb-6">
                                {details.ingredients && details.ingredients.length > 0 ? (
                                    details.ingredients.map((ing, index) => (
                                        <View key={index} className={`flex-row justify-between items-center py-3 
                                        ${index < (details.ingredients?.length || 0) - 1 ? 'border-b border-brand-dark' : ''}`}>
                                            <View className="flex-1">
                                                <Text className="text-brand-text font-medium">{ing.product?.name || "Produkt"}</Text>
                                                <Text className="text-brand-muted text-xs">
                                                    {ing.product?.calories} kcal w 100{ing.product?.servingUnit}
                                                </Text>
                                            </View>
                                            <View className="bg-brand-dark px-3 py-1 rounded-lg">
                                                <Text className="text-brand-vivid font-bold">{ing.amount} {ing.product?.servingUnit || 'g'}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-brand-muted text-center py-2">Brak listy składników.</Text>
                                )}
                            </View>

                            {details.description && (
                                <>
                                    <Text className="text-white text-xl font-bold mb-3">Przygotowanie</Text>
                                    <View className="bg-brand-card rounded-2xl border border-brand-accent p-5 mb-6">
                                        <Text className="text-brand-text leading-6">{details.description}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-brand-muted">Nie udało się wczytać przepisu.</Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default function RecipesScreen() {
  const router = useRouter();
  const { userData } = useAuth();
  
  const [recipes, setRecipes] = useState<RecipeListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const fetchRecipes = async () => {
      try {
          const res = await apiClient.get('/api/Recipes');
          setRecipes(res.data);
      } catch (e) {
          console.error("Błąd pobierania przepisów:", e);
      } finally {
          setLoading(false);
      }
  };

  useFocusEffect(
      useCallback(() => {
          fetchRecipes();
      }, [])
  );

  const myRecipes = recipes.filter(r => r.userId === userData?.userId);
  const otherRecipes = recipes.filter(r => r.userId !== userData?.userId);

  const renderSection = (title: string, data: RecipeListDto[]) => {
    if (data.length === 0) return null;

    return (
        <View className="mb-8">
          <FlatList
            data={data}
            renderItem={({ item }) => <RecipeCard item={item} onPress={setSelectedRecipeId} />}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      );
  };

  if (loading && recipes.length === 0) {
      return (
          <View className="flex-1 bg-brand-dark justify-center items-center">
              <ActivityIndicator size="large" color="#E0AAFF" />
          </View>
      );
  }

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 mb-6 flex-row justify-between items-center">
        <Text className="text-brand-text text-3xl font-bold">Przepisy</Text>
        <TouchableOpacity 
            className="bg-brand-primary p-2 rounded-full shadow-lg"
            onPress={() => router.push({ pathname: '/add', params: { activeTab: 'recipe' } } as any)}
        >
            <Ionicons name="add" size={24} color="#E0AAFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {myRecipes.length > 0 ? (
            renderSection('Twoje przepisy', myRecipes)
        ) : (
            <View className="px-5 mb-8">
                <Text className="text-brand-text text-xl font-bold mb-2">Twoje przepisy</Text>
                <View className="bg-brand-card p-6 rounded-2xl border border-dashed border-brand-accent items-center">
                    <MaterialCommunityIcons name="chef-hat" size={48} color="#4B5563" />
                    <Text className="text-brand-muted text-center mt-2">Nie dodałeś jeszcze żadnego przepisu.</Text>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/add', params: { activeTab: 'recipe' } } as any)}>
                        <Text className="text-brand-vivid text-center mt-3 font-bold text-lg">Utwórz przepis +</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
        {recipes.length === 0 && !loading && (
             <View className="mt-10 items-center">
                 <Text className="text-brand-muted">Brak przepisów w bazie.</Text>
             </View>
        )}

        <View className="h-24" />
      </ScrollView>

      <RecipeDetailModal 
        visible={!!selectedRecipeId} 
        recipeId={selectedRecipeId} 
        onClose={() => setSelectedRecipeId(null)} 
      />
    </View>
  );
}