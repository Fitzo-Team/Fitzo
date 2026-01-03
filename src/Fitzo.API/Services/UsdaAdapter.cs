using System.Net.Http.Json;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.Extensions.Configuration;

namespace Fitzo.API.Services;

public class UsdaAdapter : INutritionProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public UsdaAdapter(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["UsdaApiKey"] ?? throw new ArgumentNullException("Brakuje klucza USDA API!");
    }

    public virtual async Task<ProductDto?> GetProductAsync(string id)
    {
        var cleanId = id.StartsWith("usda:") ? id.Substring(5) : id;

        var url = $"fdc/v1/food/{cleanId}?api_key={_apiKey}";

        try
        {
            var usdaItem = await _httpClient.GetFromJsonAsync<UsdaFoodItem>(url);

            if (usdaItem == null) return null;

            return MapToDto(usdaItem);
        }
        catch
        {
            return null;
        }
    }

    public virtual async Task<IEnumerable<ProductDto>> SearchProductsAsync(ProductSearchFilterDto filter)
    {
        if (string.IsNullOrWhiteSpace(filter.Query))
        {
            return Enumerable.Empty<ProductDto>();
        }

        var request = new
        {
            searchTerm = filter.Query,
            pageSize = filter.PageSize,
            pageNumber = filter.Page,
            dataType = new[] { "Foundation", "Survey (FNDDS)", "SR Legacy" }
        };

        var url = $"fdc/v1/foods/search?api_key={_apiKey}";

        try
        {
            var response = await _httpClient.PostAsJsonAsync(url, request);
            response.EnsureSuccessStatusCode();

            var data = await response.Content.ReadFromJsonAsync<UsdaSearchResult>();

            if (data?.Foods == null) return Enumerable.Empty<ProductDto>();

            return data.Foods.Select(MapToDto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"USDA Search Error: {ex.Message}");
            return Enumerable.Empty<ProductDto>();
        }
    }

    private ProductDto MapToDto(UsdaFoodItem item)
    {
        return new ProductDto
        {
            ExternalId = $"usda:{item.FdcId}",
            Name = item.Description ?? "Bez nazwy",
            brand = item.BrandName ?? "USDA Generic",
            
            Calories = GetNutrientValue(item.FoodNutrients, "Energy"),
            Protein = GetNutrientValue(item.FoodNutrients, "Protein"),
            Carbs = GetNutrientValue(item.FoodNutrients, "Carbohydrate"),
            Fat = GetNutrientValue(item.FoodNutrients, "Total fat"),

            NutriScore = null,
            EcoScore = null,
            HasPalmOil = null,
            labels = new List<string>(),
            Allergens = new List<string>(),

            IsDataComplete = true,
            DataQualityMessages = new List<string> 
            { 
                "Produkt z bazy USDA (USA). Szczegółowe wskaźniki (Nutri-Score, Eco-Score) nie są dostępne dla tego regionu." 
            }
        };
    }

    private double GetNutrientValue(List<UsdaNutrient> nutrients, string namePart)
    {
        if (nutrients == null) return 0;

        var nutrient = nutrients.FirstOrDefault(n => 
            n.NutrientName != null && 
            n.NutrientName.Contains(namePart, StringComparison.OrdinalIgnoreCase));
            
        return nutrient?.Value ?? 0;
    }
}