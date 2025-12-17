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

        string cacheKey = $"nutrition_{query.ToLower().Trim()}";

        if (_cache.TryGetValue(cacheKey, out ProductDto cachedProduct))
        {
            Console.WriteLine($"[Cache Proxy] Zwracam z pamięci: {query}");
            return cachedProduct;
        }

        Console.WriteLine($"[Cache Proxy] Brak w pamięci, pytam API: {query}");
        var product = await _innerProvider.GetProductAsync(query);

        if (product != null)
        {
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10)) 
                .SetSlidingExpiration(TimeSpan.FromMinutes(2));

            _cache.Set(cacheKey, product, options);
        }

        return product;
    }
}