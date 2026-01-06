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