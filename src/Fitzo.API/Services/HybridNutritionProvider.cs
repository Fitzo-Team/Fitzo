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

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string query)
    {
        var offTask = SafeSearch(offAdapter, query);
        var usdaTask = SafeSearch(usdaAdapter, query);

        await Task.WhenAll(offTask, usdaTask);

        var offResults = await offTask;
        var usdaResults = await usdaTask;

        return usdaResults.Concat(offResults);
    }

    public async Task<IEnumerable<ProductDto>> SafeSearch(INutritionProvider provider, string query)
    {
        try
    {
        return await provider.SearchProductsAsync(query);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[HybridProvider] Błąd w jednym z adapterów: {ex.Message}");
        return Enumerable.Empty<ProductDto>();
    }
    }
}