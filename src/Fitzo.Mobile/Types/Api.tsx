export enum MealType {
  Breakfast = 'Breakfast',
  SecondBreakfast = 'SecondBreakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
  Supper = 'Supper'
}

export enum FoodCategory {
  Vegetables = 'Vegetables',
  Fruits = 'Fruits',
  Dairy = 'Dairy',
  Meat = 'Meat',
  Grains = 'Grains',
  Fats = 'Fats',
  Sweets = 'Sweets',
  Beverages = 'Beverages',
  NutsAndSeeds = 'NutsAndSeeds',
  SpicesSauces = 'SpicesSauces',
  Unknown = 'Unknown'
}

export interface ProductDto {
  externalId?: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  category?: FoodCategory;
  servingSize?: number;
  servingUnit?: string;
  nutriScore?: string;
  hasPalmOil?: boolean;
}

export interface UserProfileDto {
  weight: number;
  height: number;
  age: number;
  gender: 'Male' | 'Female';
}

export interface AddFoodEntryDto {
  date: string;
  mealType: MealType;
  product: ProductDto;
  amount: number;
  recipeId?: string;
}

export interface FoodItem extends ProductDto {
  id?: string;
  name: string;
  amount?: number;
  barcode?: string;
}

export interface AddWeightDto {
  weight: number;
  date: string;
}

export interface ShoppingListItem {
  productId?: string;
  name?: string;
  totalAmount: number;
  unit?: string;
  category?: string;
  isBought: boolean;
}

export enum DietTag {
  Vegan = 'Vegan',
  Vegetarian = 'Vegetarian',
  Keto = 'Keto',
  HighProtein = 'HighProtein'
}

export interface IngredientDto {
  product: ProductDto;
  amount: number;
}

export interface CreateRecipeDto {
  name: string;
  imageUrl?: string;
  tags?: string[];
  ingredients: IngredientDto[];
}

export interface WeightEntryDto {
  id?: string;
  weight: number;
  date: string;
}
export interface UserStatsDto {
    caloriesConsumed: number;
    caloriesTarget: number;
    proteins: number;
    carbs: number;
    fats: number;
    proteinsTarget: number;
    carbsTarget: number;
    fatsTarget: number;
    steps: number;
    stepsTarget: number;
    weightCurrent: number;
}

export interface Recipe {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  ingredients?: IngredientDto[]; 
  components?: any[]; 
}