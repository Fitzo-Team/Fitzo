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
        var url = $"api/v2/product/{id}.json"; //Zmienic .net na .org gdzy apka bedzie gotowa
        var response = await httpClient.GetFromJsonAsync<offResponse>(url);

        if(response == null || response.Status != 1)
            return null;

        return new ProductDto
        {
            ExternalId = response.Product.Id,
            Name = response.Product.ProductName,
            Calories = response.Product.Nutriments.Calories ?? 0,
            Protein = response.Product.Nutriments.Proteins ?? 0,
            Fat = response.Product.Nutriments.Fat ?? 0,
            Carbs = response.Product.Nutriments.Carbs ?? 0
        };
    }
}