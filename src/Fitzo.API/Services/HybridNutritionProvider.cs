using System.Net.Http.Json;
using System.Net.Http.Headers;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Services;

public class HybridNutritionProvider : INutritionProvider
{
    private readonly UsdaAdapter usdaAdapter;
    private readonly OffAdapter offAdapter;
    public HybridNutritionProvider(UsdaAdapter _usdaAdapter, OffAdapter _offAdapter)
    {
        usdaAdapter = _usdaAdapter;
        offAdapter = _offAdapter;
    }

    public async Task<ProductDto> GetProductAsync(string query)
    {
        //kod kreskowy to same cyfry
        bool isBarcode = long.TryParse(query, out _);

        if (isBarcode)
        {
            Console.WriteLine($"[HybridProvider] Wykryto kod kreskowy: {query}. Używanie Off");
            return await offAdapter.GetProductAsync(query);
        }
        else
        {
            Console.WriteLine($"[HybridProvider] Nie wykryto kodu kreskowego: {query}. Używanie usda");
            return await usdaAdapter.GetProductAsync(query);
        }
    }
}