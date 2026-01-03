using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.Extensions.Caching.Memory;
using System.Text;

namespace Fitzo.API.Services.Proxies;

public class CachingNutritionProxy : INutritionProvider
{
    private readonly INutritionProvider _innerProvider;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CachingNutritionProxy> _logger;

    public CachingNutritionProxy(INutritionProvider innerProvider, IMemoryCache cache, ILogger<CachingNutritionProxy> logger)
    {
        _innerProvider = innerProvider;
        _cache = cache;
        _logger = logger;
    }

    public async Task<ProductDto?> GetProductAsync(string id)
    {
        string cacheKey = $"product_{id.ToLower().Trim()}";

        if (_cache.TryGetValue(cacheKey, out ProductDto? cachedProduct))
        {
            _logger.LogInformation("[Cache Proxy] Zwracam produkt z pamięci: {Id}", id);
            return cachedProduct;
        }

        _logger.LogInformation("[Cache Proxy] Brak produktu w pamięci, pytam API: {Id}", id);
        
        var product = await _innerProvider.GetProductAsync(id);

        if (product != null)
        {            
            _cache.Set(cacheKey, product, TimeSpan.FromMinutes(15));
        }

        return product;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(ProductSearchFilterDto filter)
    {
        string cacheKey = BuildSearchCacheKey(filter);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<ProductDto>? cachedResults))
        {
            _logger.LogInformation("[Cache Proxy] Zwracam wyniki wyszukiwania z pamięci: {Key}", cacheKey);
            return cachedResults ?? Enumerable.Empty<ProductDto>();
        }

        _logger.LogInformation("[Cache Proxy] Brak wyników w pamięci, pytam API: {Key}", cacheKey);
        
        var results = await _innerProvider.SearchProductsAsync(filter);

        if (results != null && results.Any())
        {
            _cache.Set(cacheKey, results, TimeSpan.FromMinutes(5));
        }

        return results ?? Enumerable.Empty<ProductDto>();
    }

    private string BuildSearchCacheKey(ProductSearchFilterDto f)
    {
        var sb = new StringBuilder("search_");

        if (!string.IsNullOrEmpty(f.Query)) sb.Append($"q:{f.Query.ToLower().Trim()}_");
        if (!string.IsNullOrEmpty(f.Category)) sb.Append($"cat:{f.Category}_");
        if (!string.IsNullOrEmpty(f.Nutriscore)) sb.Append($"ns:{f.Nutriscore}_");
        
        if (f.NoPalmOil) sb.Append("palm:1_");
        if (f.Vegetarian) sb.Append("vege:1_");
        if (f.Vegan) sb.Append("vegan:1_");

        sb.Append($"pg:{f.Page}_sz:{f.PageSize}");

        return sb.ToString();
    }
}