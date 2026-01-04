
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Entities;

public class FoodEntry
{
    public Guid Id {get; set;} = Guid.NewGuid();
    public Guid UserId {get; set;}
    public DateTime Date {get; set;}
    public MealType MealType {get; set;}

    public ProductDto ProductEntry {get; set;}
    public double Amount {get; set;}
    public Guid? OriginalRecipeId {get; set;}
    public string? OriginRecipeName {get; set;}

    public double CalculateCalories() => (ProductEntry.Calories * Amount)/100 ;
    public double CalculateProtein() => (ProductEntry.Protein * Amount)/100 ;
    public double CalculateFat() => (ProductEntry.Fat * Amount)/100 ;
    public double CalculateCarbs() => (ProductEntry.Carbs * Amount)/100 ;
}