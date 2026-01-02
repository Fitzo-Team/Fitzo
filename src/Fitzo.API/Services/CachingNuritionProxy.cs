using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.Extensions.Caching.Memory;

namespace Fitzo.API.Services.Proxies;

public class CachingNutritionProxy : INutritionProvider
{
    private readonly INutritionProvider _innerProvider;
    private readonly IMemoryCache _cache;

    public CachingNutritionProxy(INutritionProvider innerProvider, IMemoryCache cache)
    {
        _innerProvider = innerProvider;
        _cache = cache;
    }

    public async Task<ProductDto> GetProductAsync(string query)
    {

        string cacheKey = $"product_{query.ToLower().Trim()}";

        if (_cache.TryGetValue(cacheKey, out ProductDto cachedProduct))
        {
            Console.WriteLine($"[Cache Proxy] Zwracam z pamięci: {query}");
            return cachedProduct;
        }

        Console.WriteLine($"[Cache Proxy] Brak w pamięci, pytam API: {query}");
        var product = await _innerProvider.GetProductAsync(query);

        if (product != null)
        {
            // var options = new MemoryCacheEntryOptions()
            //     .SetAbsoluteExpiration(TimeSpan.FromMinutes(10)) 
            //     .SetSlidingExpiration(TimeSpan.FromMinutes(2));

            //_cache.Set(cacheKey, product, options);
            
            _cache.Set(cacheKey, product, TimeSpan.FromMinutes(10));
        }

        return product;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string query)
    {
        string cacheKey = $"search_{query.ToLower().Trim()}";

        if (_cache.TryGetValue(cacheKey, out IEnumerable<ProductDto> cachedResults))
        {
            Console.WriteLine($"[Cache Proxy-search] Zwracam z pamięci: {query}");
            return cachedResults;
        }

        Console.WriteLine($"[Cache Proxy-search] Brak w pamięci, pytam API: {query}");
        var results = await _innerProvider.SearchProductsAsync(query);

        if (results != null && results.Any())
        {
            
            _cache.Set(cacheKey, results, TimeSpan.FromMinutes(5));
        }

        return results ?? Enumerable.Empty<ProductDto>();
    }
}
