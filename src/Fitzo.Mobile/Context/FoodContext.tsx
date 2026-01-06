import React, { createContext, useState, useContext } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../Services/ApiClient';
import { FoodItem, ProductDto, MealType, AddFoodEntryDto } from '../Types/Api';

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
}

const FoodContext = createContext<FoodContextType>({} as FoodContextType);

export const FoodProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [dailyMeals, setDailyMeals] = useState<Record<string, FoodItem[]>>({});
  const [productHistory, setProductHistory] = useState<FoodItem[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        amount: food.amount || 100,
        product: {
            calories: food.calories,
            protein: food.protein || 0,
            fat: food.fat || 0,
            carbs: food.carbs || 0,
            name: food.name,
        }
      };

      await apiClient.post('/api/DiaryCotroller', payload);
      
    } catch (e) {
      console.error("Błąd zapisu w API", e);
      alert('Nie udało się zsynchronizować z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFood = (date: string, mealType: MealType, id: string) => {
    const key = `${date}_${mealType}`;
    setDailyMeals(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));
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
      isLoading 
    }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);