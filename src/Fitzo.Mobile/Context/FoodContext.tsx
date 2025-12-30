import React, { createContext, useState, useContext, useEffect } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  barcode?: string;
}

interface FoodContextType {
  dailyMeals: Record<string, FoodItem[]>;
  productHistory: FoodItem[];
  addFood: (date: string, mealType: MealType, food: Omit<FoodItem, 'id'>) => void;
  removeFood: (date: string, mealType: MealType, id: string) => void;
  scannedCode: string | null;
  setScannedCode: (code: string | null) => void;
}

const FoodContext = createContext<FoodContextType>({} as FoodContextType);

export const FoodProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [dailyMeals, setDailyMeals] = useState<Record<string, FoodItem[]>>({});
  const [productHistory, setProductHistory] = useState<FoodItem[]>([]);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const addFood = (date: string, mealType: MealType, food: Omit<FoodItem, 'id'>) => {
    const newItem = { ...food, id: uuidv4() };
    const key = `${date}_${mealType}`;

    setDailyMeals(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newItem]
    }));

    setProductHistory(prev => {
      const exists = prev.find(p => p.name.toLowerCase() === food.name.toLowerCase());
      if (!exists) {
        return [newItem, ...prev];
      }
      return prev;
    });
  };

  const removeFood = (date: string, mealType: MealType, id: string) => {
    const key = `${date}_${mealType}`;
    setDailyMeals(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));
  };

  return (
    <FoodContext.Provider value={{ dailyMeals, productHistory, addFood, removeFood, scannedCode, setScannedCode }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);