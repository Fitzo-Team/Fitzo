import React, { createContext, useState, useContext } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../Services/ApiClient';
import { FoodItem, ProductDto, MealType, AddFoodEntryDto,
         CreateRecipeDto, IngredientDto, ShoppingListItem} from '../Types/Api';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
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

  const getDateKey = (dateStr: string) => dateStr.split('T')[0];

  const fetchDailyMeals = async (date: string) => {
    try {
      const dateKey = getDateKey(date);
      const isoDate = new Date(date).toISOString();
      const res = await apiClient.get('/api/DiaryCotroller', { params: { date: isoDate } });
      const entries = res.data; 
      const newMealsForDate: Record<string, FoodItem[]> = {};

      if (Array.isArray(entries)) {
        entries.forEach((entry: any) => {
          if (!entry.product) return;
          const entryDateKey = entry.date ? getDateKey(entry.date) : dateKey;
          const key = `${entryDateKey}_${entry.mealType}`;
          if (!newMealsForDate[key]) newMealsForDate[key] = [];

          const amount = entry.amount || 100;
          const factor = amount / 100;

          const item: FoodItem = {
            id: entry.id || uuidv4(),
            name: entry.product.name || 'Nieznany produkt',
            calories: entry.product.calories ? (entry.product.calories * factor) : 0,
            protein: entry.product.protein ? (entry.product.protein * factor) : 0,
            fat: entry.product.fat ? (entry.product.fat * factor) : 0,
            carbs: entry.product.carbs ? (entry.product.carbs * factor) : 0,
            amount: amount,
            ...entry.product
          };
          newMealsForDate[key].push(item);
        });
        setDailyMeals(prev => ({ ...prev, ...newMealsForDate }));
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
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addFood = async (date: string, mealType: MealType, food: Omit<FoodItem, 'id'>) => {
    setIsLoading(true);
    const dateKey = getDateKey(date);
    const key = `${dateKey}_${mealType}`;

    const amount = Number(food.amount) || 100;
    const factor = amount / 100;

    const newItem: FoodItem = { 
        ...food, 
        id: uuidv4(),
        calories: (food.calories || 0) * factor,
        protein: (food.protein || 0) * factor,
        fat: (food.fat || 0) * factor,
        carbs: (food.carbs || 0) * factor,
        amount: amount 
    };

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
        amount: amount,
        product: {
            calories: Number(food.calories) || 0,
            protein: Number(food.protein) || 0,
            fat: Number(food.fat) || 0,
            carbs: Number(food.carbs) || 0,
            name: food.name || "Bez nazwy",
            brand: food.brand || "",
            imageUrl: food.imageUrl || "",
            externalId: food.externalId,
            servingUnit: food.servingUnit || "g", 
            servingSize: food.servingSize || 100
        }
      };

      await apiClient.post('/api/DiaryCotroller', payload);

    } catch (e: any) {
      console.error("Błąd zapisu w API", e);
      if (e.response && e.response.status === 400) {
          Alert.alert("Błąd walidacji", "Sprawdź dane produktu.");
      } else {
          Alert.alert('Błąd', 'Nie udało się zsynchronizować z serwerem');
      }
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
            name: item.name, calories: item.calories, protein: item.protein || 0,
            fat: item.fat || 0, carbs: item.carbs || 0,
        }
      }));
      await apiClient.post('/api/Recipes', { name, ingredients: ingredientsDto, tags: [] });
      Alert.alert("Sukces", "Przepis utworzony!");
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zapisać przepisu");
    } finally { setIsLoading(false); }
  };

  const fetchShoppingList = async (start: Date, end: Date) => {
      try {
          const res = await apiClient.get('/api/Planning/shopping-list', {
              params: { startDate: start.toISOString(), endDate: end.toISOString() }
          });
          setShoppingList(res.data);
      } catch (e) { console.error("Błąd listy zakupów", e); }
  };

  const removeFood = (date: string, mealType: MealType, id: string) => {
    const dateKey = getDateKey(date);
    const key = `${dateKey}_${mealType}`;
    setDailyMeals(prev => ({
      ...prev,
      [key]: prev[key] ? prev[key].filter(item => item.id !== id) : []
    }));
  };

  const searchProductsApi = async (query: string): Promise<ProductDto[]> => {
    try {
      const res = await apiClient.get('/api/Product/search', { params: { Query: query, Page: 1, PageSize: 50 } });
      return res.data || [];
    } catch (e) { return []; }
  };

  const getProductDetails = async (id: string): Promise<ProductDto | null> => {
      try {
          const res = await apiClient.get(`/api/Product/${id}`);
          return res.data;
      } catch(e) { return null; }
  };

  const exportData = async () => {
      setIsLoading(true);
      try {
          const res = await apiClient.get('/api/Export/recipes/json');
          const dataStr = JSON.stringify(res.data);
          if (!cacheDirectory) throw new Error("Brak cache");
          const fileUri = cacheDirectory + 'fitzo_data.json';
          await writeAsStringAsync(fileUri, dataStr);
          await Sharing.shareAsync(fileUri);
      } catch (e) { Alert.alert("Błąd", "Eksport nieudany"); } finally { setIsLoading(false); }
  };

  const importData = async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
          if (result.canceled) return;
          const file = result.assets[0];
          const formData = new FormData();
          formData.append('file', { uri: file.uri, name: file.name, type: 'application/json' } as any);
          setIsLoading(true);
          await apiClient.post('/api/Export/import/json', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          Alert.alert("Sukces", "Dane zaimportowane!");
      } catch (e) { Alert.alert("Błąd", "Import nieudany"); } finally { setIsLoading(false); }
  };

  return (
    <FoodContext.Provider value={{ 
      dailyMeals, productHistory, searchResults, addFood, removeFood, searchProduct, fetchDailyMeals,
      scannedCode, setScannedCode, isLoading, createRecipe, shoppingList, fetchShoppingList,
      searchProductsApi, getProductDetails, exportData, importData
    }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);