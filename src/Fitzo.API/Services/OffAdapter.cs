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

    public virtual async Task<ProductDto> GetProductAsync(string id)
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

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string query)
    {
        var url = $"cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=10";

        var offresponse = await httpClient.GetFromJsonAsync<OffSearchResponse>(url);

        if(offresponse.Products == null) return Enumerable.Empty<ProductDto>();

        return offresponse.Products.Select(p => new ProductDto
        {
            ExternalId = p.Id,
            Name = p.ProductName,
            Calories = p.Nutriments?.Calories ?? 0,
            Carbs = p.Nutriments?.Carbs ?? 0,
            Protein = p.Nutriments?.Proteins ?? 0,
            Fat = p.Nutriments?.Fat ?? 0
        });
    }
}