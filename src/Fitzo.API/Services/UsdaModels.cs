using System.Text.Json.Serialization;
using System.Diagnostics.CodeAnalysis;

namespace Fitzo.API.Services;

[ExcludeFromCodeCoverage]
public class UsdaSearchResult
{
    [JsonPropertyName("totalHits")]
    public int TotalHits { get; set; }

    [JsonPropertyName("foods")]
    public List<UsdaFoodItem> Foods { get; set; } = new();
}

[ExcludeFromCodeCoverage]
public class UsdaFoodItem
{
    [JsonPropertyName("fdcId")]
    public int FdcId { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("brandName")]
    public string? BrandName { get; set; }

    [JsonPropertyName("foodNutrients")]
    public List<UsdaNutrient> FoodNutrients { get; set; } = new();
}

[ExcludeFromCodeCoverage]
public class UsdaNutrient
{
    [JsonPropertyName("nutrientName")]
    public string NutrientName { get; set; }

    [JsonPropertyName("value")]
    public double Value { get; set; }

    [JsonPropertyName("unitName")]
    public string UnitName { get; set; }
}