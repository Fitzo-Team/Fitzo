using System.Text.Json.Serialization;
using System.Diagnostics.CodeAnalysis;

namespace Fitzo.API.Services;
public class OffSearchResponse
{
    [JsonPropertyName("products")]
    public List<OffProduct> Products { get; set; } = new();
}

public class OffProductResponse
{
    [JsonPropertyName("product")]
    public OffProduct? Product { get; set; }
}

public class OffProduct
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("product_name")]
    public string? ProductName { get; set; }

    [JsonPropertyName("brands")]
    public string? Brands { get; set; }

    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("nutrition_grades")]
    public string? NutriScoreGrade { get; set; }

    [JsonPropertyName("ecoscore_grade")]
    public string? EcoScoreGrade { get; set; }

    [JsonPropertyName("states_tags")]
    public List<string>? StatesTags { get; set; }

    [JsonPropertyName("categories_tags")] 
    public List<string>? CategoriesTags { get; set; }

    [JsonPropertyName("allergens_tags")]
    public List<string>? AllergensTags { get; set; }

    [JsonPropertyName("labels_tags")]
    public List<string>? LabelsTags { get; set; }

    [JsonPropertyName("ingredients_from_palm_oil_n")]
    public int IngredientsFromPalmOilN { get; set; }

    [JsonPropertyName("serving_quantity")]
    public double? ServingQuantity { get; set; }

    [JsonPropertyName("nutriments")]
    public OffNutriments? Nutriments { get; set; }
}

public class OffNutriments
{
    [JsonPropertyName("energy-kcal_100g")]
    public double? EnergyKcal100g { get; set; }

    [JsonPropertyName("proteins_100g")]
    public double? Proteins100g { get; set; }

    [JsonPropertyName("carbohydrates_100g")]
    public double? Carbohydrates100g { get; set; }

    [JsonPropertyName("fat_100g")]
    public double? Fat100g { get; set; }

    [JsonPropertyName("fiber_100g")]
    public double? Fiber100g { get; set; }

    [JsonPropertyName("fruits-vegetables-nuts-estimate-from-ingredients_100g")]
    public double? FruitsVegetablesNuts100g { get; set; }
}