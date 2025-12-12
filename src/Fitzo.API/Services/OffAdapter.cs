using System.Net.Http.Json;
using System.Net.Http.Headers;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Services;

public class OffAdapter : INutritionProvider
{
    private readonly HttpClient httpClient;

    public OffAdapter(HttpClient _httpClient)
    {
        httpClient = _httpClient;
    }

    public async Task<ProductDto> GetProductAsync(string id)
    {
        var url = $"api/v2/product/{id}";

        using var response = await httpClient.GetAsync(url);

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        var offResponse = await response.Content.ReadFromJsonAsync<offResponse>();

        if (offResponse?.Product == null) return null;
        return new ProductDto
        {
        Name = offResponse.Product.ProductName,
        Calories = offResponse.Product.Nutriments.Calories ?? 0,
        Carbs = offResponse.Product.Nutriments.Carbs ?? 0,
        Protein = offResponse.Product.Nutriments.Proteins ?? 0,
        Fat = offResponse.Product.Nutriments.Fat ?? 0
        };
    }
}