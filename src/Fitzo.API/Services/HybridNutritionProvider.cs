using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Services;

public class HybridNutritionProvider : INutritionProvider
{
    private readonly UsdaAdapter _usdaAdapter;
    private readonly OffAdapter _offAdapter;
    private readonly ILogger<HybridNutritionProvider> _logger;

    public HybridNutritionProvider(UsdaAdapter usdaAdapter, OffAdapter offAdapter, ILogger<HybridNutritionProvider> logger)
    {
        _usdaAdapter = usdaAdapter;
        _offAdapter = offAdapter;
        _logger = logger;
    }

    public async Task<ProductDto?> GetProductAsync(string id)
    {
        if (id.StartsWith("off:")) return await _offAdapter.GetProductAsync(id);
        if (id.StartsWith("usda:")) return await _usdaAdapter.GetProductAsync(id);
        
        return null;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(ProductSearchFilterDto filter)
    {
        var tasks = new List<Task<IEnumerable<ProductDto>>>();

        tasks.Add(SafeSearch(_offAdapter, filter));

        if (!filter.HasAdvancedFilters)
        {
            tasks.Add(SafeSearch(_usdaAdapter, filter));
        }

        await Task.WhenAll(tasks);

        var results = new List<ProductDto>();

        foreach (var task in tasks)
        {
            results.AddRange(task.Result);
        }

        return results;
    }

    private async Task<IEnumerable<ProductDto>> SafeSearch(INutritionProvider provider, ProductSearchFilterDto filter)
    {
        try
        {
            return await provider.SearchProductsAsync(filter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Błąd w adapterze {ProviderName}", provider.GetType().Name);
            
            return Enumerable.Empty<ProductDto>();
        }
    }
}