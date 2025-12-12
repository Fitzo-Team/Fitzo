using System.Net.Http.Json;
using System.Net.Http.Headers;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.Extensions.Configuration;

namespace Fitzo.API.Services;

public class UsdaAdapter : INutritionProvider
{
    public HttpClient httpClient;
    private readonly string apiKey;
    public UsdaAdapter(HttpClient _httpClient, IConfiguration configuration)
    {
        httpClient = _httpClient;
        apiKey = configuration["UsdaApiKey"] ?? throw new Exception("Brakuje klucza USDA API!");
    }

    public async Task<ProductDto> GetProductAsync(string query)
    {
        var url = $"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={apiKey}&query={query}&dataType=Foundation,SR Legacy&pageSize=1&requireAllWords=true";
        var response = await httpClient.GetFromJsonAsync<UsdaSearchResult>(url);

        if(response == null || !response.Foods.Any())
        {
            return null;
        }

        var usdaItem = response.Foods.First();

        return new ProductDto
        {
            Name = usdaItem.Description,
            Calories = GetNutrientValue(usdaItem.FoodNutrients, "Energy"),
            Protein = GetNutrientValue(usdaItem.FoodNutrients, "Protein"),
            Carbs = GetNutrientValue(usdaItem.FoodNutrients, "Carbohydrate, by difference"),
            Fat = GetNutrientValue(usdaItem.FoodNutrients, "Total lipid (fat)")
        };
        }

        private double GetNutrientValue(List<UsdaNutrient> nutrients, string name)
        {
            var nutrient = nutrients.FirstOrDefault(n => n.NutrientName.Contains(name, StringComparison.OrdinalIgnoreCase));
            return nutrient?.Value ?? 0;
        }
    }
