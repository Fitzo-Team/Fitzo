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
        apiKey = configuration["UsdaApiKey"] ?? throw new ArgumentNullException("Brakuje klucza USDA API!");
    }

    public virtual async Task<ProductDto> GetProductAsync(string query)
    {
        var url = $"fdc/v1/foods/search?api_key={apiKey}&query={query}&dataType=Foundation,SR Legacy&pageSize=1&requireAllWords=true";
        var response = await httpClient.GetFromJsonAsync<UsdaSearchResult>(url);

        if(response == null || response.Foods.Count == 0)
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


    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string query)
    {
        var request = new
        {
            query = query,
            pageSize = 10,
            dataType = new[] { "Foundation", "Survey (FNDDS)"}
        };

        var response = await httpClient.PostAsJsonAsync("fdc/v1/foods/search", request);
        var data = await response.Content.ReadFromJsonAsync<UsdaSearchResult>();

        return data.Foods.Select(f => new ProductDto
        {
            ExternalId = f.FdcId.ToString(),
            Name = f.Description,
            Calories = GetNutrientValue(f.FoodNutrients, "Energy"),
            Protein = GetNutrientValue(f.FoodNutrients, "Protein"),
            Carbs = GetNutrientValue(f.FoodNutrients, "Carbohydrate, by difference"),
            Fat = GetNutrientValue(f.FoodNutrients, "Total lipid (fat)")
        });
    }
    }
