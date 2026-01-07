import React, { createContext, useState, useContext } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../Services/ApiClient';
import { FoodItem, ProductDto, MealType, AddFoodEntryDto,
         CreateRecipeDto, IngredientDto, ShoppingListItem} from '../Types/Api';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface FoodContextType {
  dailyMeals: Record<string, FoodItem[]>;
  searchResults: FoodItem[];
  productHistory: FoodItem[];

  searchProduct: (query: string) => Promise<void>;
  addFood: (date: string, mealType: MealType, food: Omit<FoodItem, 'id'>) => Promise<void>;
  fetchDailyMeals: (date: string) => Promise<void>;
  removeFood: (date: string, mealType: MealType, id: string) => void;

  scannedCode: string | null;
  setScannedCode: (code: string | null) => void;
  isLoading: boolean;

  createRecipe: (name: string, ingredients: FoodItem[]) => Promise<void>;
  shoppingList: ShoppingListItem[];
  fetchShoppingList: (start: Date, end: Date) => Promise<void>;

  searchProductsApi: (query: string) => Promise<ProductDto[]>;
  getProductDetails: (id: string) => Promise<ProductDto | null>;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType>({} as FoodContextType);

export const FoodProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [dailyMeals, setDailyMeals] = useState<Record<string, FoodItem[]>>({});
  const [productHistory, setProductHistory] = useState<FoodItem[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const fetchDailyMeals = async (date: string) => {
    try {
      const isoDate = new Date(date).toISOString();
      const res = await apiClient.get('/api/DiaryCotroller', { params: { date: isoDate } });
      
      const entries = res.data; 
      const newMeals: Record<string, FoodItem[]> = {};

      if (Array.isArray(entries)) {
        entries.forEach((entry: any) => {
          const key = `${date}_${entry.mealType}`;
          if (!newMeals[key]) newMeals[key] = [];
          
          const item: FoodItem = {
            id: entry.id || uuidv4(),
            name: entry.product.name || 'Nieznany produkt',
            calories: entry.product.calories * (entry.amount / 100),
            protein: entry.product.protein * (entry.amount / 100),
            fat: entry.product.fat * (entry.amount / 100),
            carbs: entry.product.carbs * (entry.amount / 100),
            amount: entry.amount,
            ...entry.product
          };
          newMeals[key].push(item);
        });
        setDailyMeals(prev => ({ ...prev, ...newMeals }));
      }

    } catch (e) {
      console.error("Błąd pobierania dziennika", e);
    }
  };

  const searchProduct = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/Product/search', {
        params: { Query: query, Page: 1, PageSize: 20 }
      });
      
      const products: FoodItem[] = (res.data || []).map((p: ProductDto) => ({
        ...p,
        id: uuidv4(),
        name: p.name || 'Bez nazwy',
      }));
      setSearchResults(products);
    } catch (e) {
      console.error("Szukanie nieudane", e);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addFood = async (date: string, mealType: MealType, food: Omit<FoodItem, 'id'>) => {
    setIsLoading(true);

    const newItem = { ...food, id: uuidv4() };
    const key = `${date}_${mealType}`;
    
    setDailyMeals(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newItem]
    }));

    setProductHistory(prev => {
      const exists = prev.find(p => (p.name || '').toLowerCase() === (food.name || '').toLowerCase());
      return exists ? prev : [newItem, ...prev];
    });

    try {
      const payload: AddFoodEntryDto = {
        date: new Date(date).toISOString(),
        mealType: mealType,
        amount: Number(food.amount) || 100,
        product: {
            calories: Number(food.calories),
            protein: Number(food.protein) || 0,
            fat: Number(food.fat) || 0,
            carbs: Number(food.carbs) || 0,
            name: food.name,
        }
      };

      await apiClient.post('/api/DiaryCotroller', payload);
      
    } catch (e) {
      console.error("Błąd zapisu w API", e);
      Alert.alert('Błąd', 'Nie udało się zsynchronizować z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  const createRecipe = async (name: string, ingredients: FoodItem[]) => {
    setIsLoading(true);
    try {
      const ingredientsDto: IngredientDto[] = ingredients.map(item => ({
        amount: item.amount || 100,
        product: {
            name: item.name,
            calories: item.calories,
            protein: item.protein || 0,
            fat: item.fat || 0,
            carbs: item.carbs || 0,
        }
      }));

      const payload: CreateRecipeDto = {
        name,
        ingredients: ingredientsDto,
        tags: []
      };

      await apiClient.post('/api/Recipes', payload);
      Alert.alert("Sukces", "Przepis utworzony!");
      
    } catch (e) {
      console.error("Błąd tworzenia przepisu", e);
      Alert.alert("Błąd", "Nie udało się zapisać przepisu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShoppingList = async (start: Date, end: Date) => {
      try {
          const res = await apiClient.get('/api/Planning/shopping-list', {
              params: {
                  startDate: start.toISOString(),
                  endDate: end.toISOString()
              }
          });
          setShoppingList(res.data);
      } catch (e) {
          console.error("Błąd listy zakupów", e);
      }
  };

  const removeFood = (date: string, mealType: MealType, id: string) => {
    const key = `${date}_${mealType}`;
    setDailyMeals(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));
  };

  const searchProductsApi = async (query: string): Promise<ProductDto[]> => {
    try {
      const res = await apiClient.get('/api/Product/search', {
        params: { Query: query, Page: 1, PageSize: 50 }
      });
      return res.data || [];
    } catch (e) {
      console.error("Szukanie nieudane", e);
      return [];
    }
  };

  const getProductDetails = async (id: string): Promise<ProductDto | null> => {
      try {
          const res = await apiClient.get(`/api/Product/${id}`);
          return res.data;
      } catch(e) {
          console.error("Błąd pobierania detali", e);
          return null;
      }
  };

  const exportData = async () => {
      setIsLoading(true);
      try {
          const res = await apiClient.get('/api/Export/recipes/json');
          const dataStr = JSON.stringify(res.data);

          const dir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
          
          const fileUri = dir + 'fitzo_data.json';
          
          await FileSystem.writeAsStringAsync(fileUri, dataStr);
          await Sharing.shareAsync(fileUri);
      } catch (e) {
          console.error(e);
          Alert.alert("Błąd", "Eksport nieudany");
      } finally {
          setIsLoading(false);
      }
  };

  const importData = async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
          if (result.canceled) return;

          const file = result.assets[0];
          const formData = new FormData();
          
          formData.append('file', {
              uri: file.uri,
              name: file.name,
              type: 'application/json'
          } as any);

          setIsLoading(true);
          await apiClient.post('/api/Export/import/json', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          Alert.alert("Sukces", "Dane zaimportowane!");
      } catch (e) {
          Alert.alert("Błąd", "Import nieudany");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <FoodContext.Provider value={{ 
      dailyMeals, 
      productHistory, 
      searchResults, 
      addFood, 
      removeFood, 
      searchProduct, 
      fetchDailyMeals, 
      scannedCode, 
      setScannedCode, 
      isLoading,
      createRecipe,
      shoppingList,
      fetchShoppingList,
      searchProductsApi,
      getProductDetails,
      exportData,
      importData
    }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);