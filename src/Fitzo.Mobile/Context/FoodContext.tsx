import React, { createContext, useState, useContext, useEffect } from "react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import apiClient from "../Services/ApiClient";
import {
  FoodItem,
  ProductDto,
  MealType,
  AddFoodEntryDto,
  CreateRecipeDto,
  IngredientDto,
  Recipe,
} from "../Types/Api";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { cacheDirectory, writeAsStringAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ShoppingListItem {
  productId?: string;
  name: string;
  totalAmount: number;
  unit: string;
  isBought: boolean;
  category: string;
  sources: string[];
}

interface FoodContextType {
  dailyMeals: Record<string, FoodItem[]>;
  searchResults: FoodItem[];
  productHistory: FoodItem[];
  recipes: Recipe[];
  shoppingList: ShoppingListItem[];
  scannedCode: string | null;
  isLoading: boolean;

  searchProduct: (query: string) => Promise<void>;
  searchProductsApi: (query: string) => Promise<ProductDto[]>;
  getProductDetails: (id: string) => Promise<ProductDto | null>;

  addFood: (
    date: string,
    mealType: MealType,
    food: Omit<FoodItem, "id">
  ) => Promise<void>;
  addRecipeToDiary: (
    date: string,
    mealType: MealType,
    recipe: Recipe,
    quantity: number
  ) => Promise<void>;
  createRecipe: (name: string, ingredients: FoodItem[]) => Promise<void>;
  removeFood: (date: string, mealType: MealType, id: string) => void;

  fetchDailyMeals: (date: string) => Promise<void>;
  fetchRecipes: () => Promise<void>;

  fetchShoppingList: (start: Date, end: Date) => Promise<void>;
  toggleShoppingItem: (itemName: string) => void;

  setScannedCode: (code: string | null) => void;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  addToHistory: (item: FoodItem) => Promise<void>;
}

const FoodContext = createContext<FoodContextType>({} as FoodContextType);

export const FoodProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dailyMeals, setDailyMeals] = useState<Record<string, FoodItem[]>>({});
  const [productHistory, setProductHistory] = useState<FoodItem[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDateKey = (dateStr: string) => dateStr.split("T")[0];

  const refreshHistory = async () => {
    try {
      let localItems: FoodItem[] = [];
      const jsonValue = await AsyncStorage.getItem("@product_history");
      if (jsonValue != null) {
        localItems = JSON.parse(jsonValue);
      }

      let serverItems: FoodItem[] = [];
      try {
        const res = await apiClient.get("/api/DiaryCotroller/recent");
        serverItems = (res.data || []).map((p: ProductDto) => ({
          ...p,
          id: uuidv4(),
          name: p.name || "Bez nazwy",
        }));
      } catch (err) {
        console.log("Błąd API historii (może offline):", err);
      }

      const combined = [...localItems, ...serverItems];
      const uniqueMap = new Map();

      combined.forEach((item) => {
        const key = (item.name || "").toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      setProductHistory(Array.from(uniqueMap.values()).slice(0, 20));
    } catch (e: any) {
      console.log("Błąd odświeżania historii:", e);
    }
  };

  const addToHistory = async (item: FoodItem) => {
    setProductHistory((prev) => {
      const filtered = prev.filter(
        (p) => (p.name || "").toLowerCase() !== (item.name || "").toLowerCase()
      );
      const newHistory = [item, ...filtered].slice(0, 20);
      AsyncStorage.setItem(
        "@product_history",
        JSON.stringify(newHistory)
      ).catch((e: any) => console.log(e));
      return newHistory;
    });
  };

  const fetchShoppingList = async (start: Date, end: Date) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/Planning/shopping-list", {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      const items = (res.data || []).map((item: ShoppingListItem) => ({
        ...item,
        isBought: item.isBought || false,
      }));

      setShoppingList(items);
    } catch (e: any) {
      console.log("Błąd listy zakupów", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShoppingItem = (itemName: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.name === itemName ? { ...item, isBought: !item.isBought } : item
      )
    );
  };

  const fetchRecipes = async () => {
    try {
      const res = await apiClient.get("/api/Recipes");
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setRecipes(data);
    } catch (e: any) {
      console.log("Błąd receptur:", e);
    }
  };

  const fetchDailyMeals = async (date: string) => {
      try {
        const dateKey = getDateKey(date);
        const isoDate = new Date(date).toISOString();
        
        const res = await apiClient.get('/api/DiaryCotroller', { params: { date: isoDate } });
        const rawData = res.data;
        const entries = Array.isArray(rawData) ? rawData : (rawData?.items || []);

        const newMealsForDate: Record<string, FoodItem[]> = {};

        if (Array.isArray(entries)) {
          entries.forEach((entry: any) => {
            
            const productData = entry.product || entry.productEntry || entry.ProductEntry;
            
            if (!productData) return;

            const entryDateKey = entry.date ? getDateKey(entry.date) : dateKey;
            
            let mType = entry.mealType;
            if (typeof mType === 'number') {
                const types = ["Breakfast", "SecondBreakfast", "Lunch", "Dinner", "Snack", "Supper"];
                mType = types[mType] || "Snack";
            }

            const key = `${entryDateKey}_${mType}`;
            if (!newMealsForDate[key]) newMealsForDate[key] = [];
            
            const amount = entry.amount || 0;
            let conversionFactor: number;

            if (productData.servingUnit === 'portion' || productData.servingUnit === 'szt') {
                conversionFactor = amount; 
            } else {
                conversionFactor = amount / 100; 
            }

            const item: FoodItem = {
              id: entry.id || uuidv4(),
              name: productData.name || 'Nieznany',
              amount: amount,
              servingUnit: productData.servingUnit,
              
              ...productData,

              calories: productData.calories * conversionFactor,
              protein: productData.protein * conversionFactor,
              fat: productData.fat * conversionFactor,
              carbs: productData.carbs * conversionFactor,
            };
            
            newMealsForDate[key].push(item);
          });
          
          setDailyMeals(prev => ({ ...prev, ...newMealsForDate }));
        }
      } catch (e: any) {
        console.error("Błąd pobierania dziennika", e);
      }
    };

  const addRecipeToDiary = async (
    date: string,
    mealType: MealType,
    recipe: Recipe,
    quantity: number = 1
  ) => {
    setIsLoading(true);
    const dateKey = getDateKey(date);
    const key = `${dateKey}_${mealType}`;

    let kcalPerPortion = 0;
    let pPerPortion = 0;
    let fPerPortion = 0;
    let cPerPortion = 0;

    if (recipe.ingredients) {
      recipe.ingredients.forEach((ing) => {
        const factor = ing.amount / 100;
        kcalPerPortion += ing.product.calories * factor;
        pPerPortion += ing.product.protein * factor;
        fPerPortion += ing.product.fat * factor;
        cPerPortion += ing.product.carbs * factor;
      });
    } else if ((recipe as any).totalCalories) {
      kcalPerPortion = (recipe as any).totalCalories;
      pPerPortion = (recipe as any).totalProtein;
      fPerPortion = (recipe as any).totalFat;
      cPerPortion = (recipe as any).totalCarbs;
    }

    const newItem: FoodItem = {
      id: uuidv4(),
      name: recipe.name || "Przepis",
      calories: kcalPerPortion * quantity,
      protein: pPerPortion * quantity,
      fat: fPerPortion * quantity,
      carbs: cPerPortion * quantity,
      amount: quantity,
      servingUnit: "portion",
      servingSize: 1,
    };

    setDailyMeals((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newItem],
    }));

    try {
      const payload: AddFoodEntryDto = {
        date: new Date(date).toISOString(),
        mealType: mealType,
        amount: quantity,
        recipeId: recipe.id,
        product: {
          name: recipe.name || "Przepis",
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          servingUnit: "portion",
          servingSize: 1,
        },
      };
      await apiClient.post("/api/DiaryCotroller", payload);
      await fetchDailyMeals(date);
      await refreshHistory();
    } catch (e: any) {
      console.error("Błąd dodawania przepisu", e);
      Alert.alert("Błąd", "Nie udało się dodać przepisu.");
    } finally {
      setIsLoading(false);
    }
  };

  const addFood = async (
    date: string,
    mealType: MealType,
    food: Omit<FoodItem, "id">
  ) => {
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
      amount: amount,
    };

    setDailyMeals((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newItem],
    }));
    addToHistory(newItem);

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
          servingSize: food.servingSize || 100,
          category: (food as any).category,
        },
      };

      await apiClient.post("/api/DiaryCotroller", payload);
      await refreshHistory();
    } catch (e: any) {
      if (e.response && e.response.status === 400)
        Alert.alert("Błąd walidacji");
    } finally {
      setIsLoading(false);
    }
  };

  const createRecipe = async (name: string, ingredients: FoodItem[]) => {
    setIsLoading(true);
    try {
      const ingredientsDto: IngredientDto[] = ingredients.map((item) => ({
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
          externalId: item.externalId || undefined,
        },
      }));

      const payload: CreateRecipeDto = {
        name,
        ingredients: ingredientsDto,
        tags: [],
      };
      await apiClient.post("/api/Recipes", payload);
      Alert.alert("Sukces", "Przepis utworzony!");
      await fetchRecipes();
    } catch (e: any) {
      if (e.response && e.response.status === 400)
        Alert.alert("Błąd walidacji");
    } finally {
      setIsLoading(false);
    }
  };

  const searchProduct = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/Product/search", {
        params: { Query: query, Page: 1, PageSize: 20 },
      });
      const rawData = res.data;
      const dataArray = Array.isArray(rawData) ? rawData : rawData?.items || [];
      const products: FoodItem[] = dataArray.map((p: ProductDto) => ({
        ...p,
        id: uuidv4(),
        name: p.name || "Bez nazwy",
      }));
      setSearchResults(products);
    } catch (e: any) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  const searchProductsApi = async (query: string): Promise<ProductDto[]> => {
    try {
      const res = await apiClient.get("/api/Product/search", {
        params: { Query: query, Page: 1, PageSize: 50 },
      });
      const rawData = res.data;
      return Array.isArray(rawData) ? rawData : rawData?.items || [];
    } catch (e: any) {
      return [];
    }
  };
  const getProductDetails = async (id: string): Promise<ProductDto | null> => {
    try {
      const res = await apiClient.get(`/api/Product/${id}`);
      return res.data;
    } catch (e: any) {
      return null;
    }
  };
  const removeFood = (date: string, mealType: MealType, id: string) => {
    const dateKey = getDateKey(date);
    const key = `${dateKey}_${mealType}`;
    setDailyMeals((prev) => ({
      ...prev,
      [key]: prev[key] ? prev[key].filter((item) => item.id !== id) : [],
    }));
  };
  const exportData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/Export/recipes/json");
      const dataStr = JSON.stringify(res.data);
      if (!cacheDirectory) throw new Error("Brak cache");
      const fileUri = cacheDirectory + "fitzo_data.json";
      await writeAsStringAsync(fileUri, dataStr);
      await Sharing.shareAsync(fileUri);
    } catch (e: any) {
      Alert.alert("Błąd", "Eksport nieudany");
    } finally {
      setIsLoading(false);
    }
  };
  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: "application/json",
      } as any);
      setIsLoading(true);
      await apiClient.post("/api/Export/import/json", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Sukces", "Dane zaimportowane!");
    } catch (e: any) {
      Alert.alert("Błąd", "Import nieudany");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      const init = async () => {
          await refreshHistory();
          
          await fetchRecipes();

          await fetchDailyMeals(new Date().toISOString()); 
      };
      
      init();
    }, []);

  return (
    <FoodContext.Provider
      value={{
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
        importData,
        recipes,
        fetchRecipes,
        addRecipeToDiary,
        refreshHistory,
        addToHistory,
        toggleShoppingItem,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);
