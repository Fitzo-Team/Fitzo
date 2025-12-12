using System.Text.Json.Serialization;
using System.Diagnostics.CodeAnalysis;

namespace Fitzo.API.Services;
public class offResponse
{
    [JsonPropertyName("Product")]
    public OffProduct Product {get;set;}
    [JsonPropertyName("Status")]
    public int Status {get;set;}
}
public class OffProduct
{
    [JsonPropertyName("_id")]
    public string Id { get; set; }

    [JsonPropertyName("product_name")]
    public string ProductName { get; set; }

    [JsonPropertyName("nutriments")]
    public OffNutriments Nutriments { get; set; } // 1 || 0
}
public class OffNutriments
{
    [JsonPropertyName("energy-kcal_100g")]
    public double? Calories { get; set; }

    [JsonPropertyName("proteins_100g")]
    public double? Proteins { get; set; }

    [JsonPropertyName("carbohydrates_100g")]
    public double? Carbs { get; set; }

    [JsonPropertyName("fat_100g")]
    public double? Fat { get; set; }
}