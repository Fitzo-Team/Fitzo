
using Fitzo.Shared.Enums;

namespace Ftizo.API.Services;

public static class CategoryMapper
{
    public static FoodCategories MapFromOffTags(List<string>? tags)
    {
        if(tags == null || !tags.Any())
            return FoodCategories.Unknown;

        if(HasTag(tags, "vegetab") || HasTag(tags, "plant-based"))
            return FoodCategories.Vegetables;

        if(HasTag(tags, "fruit"))
            return FoodCategories.Fruits;

        if(HasTag(tags, "dair") || HasTag(tags, "milk") || HasTag(tags, "yogurt")|| HasTag(tags, "cheese"))
            return FoodCategories.Dairy;

        if(HasTag(tags, "meat")  || HasTag(tags, "poultry") || HasTag(tags, "fish"))
            return FoodCategories.Meat;

        if(HasTag(tags, "grain") || HasTag(tags, "bread") || HasTag(tags, "pasta") || HasTag(tags, "wheat"))
            return FoodCategories.Grains;

        if(HasTag(tags, "fat") || HasTag(tags, "oil") || HasTag(tags, "butter"))
            return FoodCategories.Fats;

        if(HasTag(tags, "sugar") || HasTag(tags, "chocolate") || HasTag(tags, "candy") || HasTag(tags, "snack"))
            return FoodCategories.Sweets;

        if(HasTag(tags, "beverage") || HasTag(tags, "drink") || HasTag(tags, "juice") || HasTag(tags, "water") || HasTag(tags, "energy"))
            return FoodCategories.Beverages;

        if(HasTag(tags, "nut") || HasTag(tags, "seed"))
            return FoodCategories.NutsAndSeeds;

        if(HasTag(tags, "spice") || HasTag(tags, "sauce") || HasTag(tags, "condiment"))
            return FoodCategories.SpicesSauces;
        

        return FoodCategories.Unknown;
    }

    public static FoodCategories MapFromUsdaTags(string? category)
    {
        if(string.IsNullOrWhiteSpace(category))
            return FoodCategories.Unknown;
        
        var categ = category.ToLowerInvariant();

        if(categ.Contains("vegetab") || categ.Contains("plantbased"))
            return FoodCategories.Vegetables;

        if(categ.Contains("fruit"))
            return FoodCategories.Fruits;

        if(categ.Contains("dair") || categ.Contains("milk") || categ.Contains("cheese") || categ.Contains("yogurt"))
            return FoodCategories.Dairy;

        if(categ.Contains("meat")  || categ.Contains("poultry") || categ.Contains("fish")|| categ.Contains("beef"))
            return FoodCategories.Meat;

        if(categ.Contains("grain") || categ.Contains("bread") || categ.Contains("pasta") || categ.Contains("wheat")|| categ.Contains("baked")|| categ.Contains("cereal")) 
            return FoodCategories.Grains;

        if(categ.Contains("fat") || categ.Contains("oil") || categ.Contains("butter"))
            return FoodCategories.Fats;

        if(categ.Contains("sugar") || categ.Contains("chocolate") || categ.Contains("candy") || categ.Contains("snack")|| categ.Contains("sweet"))
            return FoodCategories.Sweets;

        if(categ.Contains("beverage") || categ.Contains("drink") || categ.Contains("juice") || categ.Contains("water") || categ.Contains("energy"))
            return FoodCategories.Beverages;

        if(categ.Contains("nut") || categ.Contains("seed"))
            return FoodCategories.NutsAndSeeds;

        if(categ.Contains("spice") || categ.Contains("sauce") || categ.Contains("condiment"))
            return FoodCategories.SpicesSauces;
        

        return FoodCategories.Unknown;
    }

    private static  bool HasTag(List<string> tags, string word)
    {
        return tags.Any(r => r.Contains(word, StringComparison.OrdinalIgnoreCase));
    }
}