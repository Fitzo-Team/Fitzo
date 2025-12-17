using Fitzo.API.Interfaces;
using Fitzo.API.Services.Proxies;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;

public class CachingProxyTests
{
    private readonly Mock<INutritionProvider> _innerProviderMock;
    private readonly IMemoryCache _realCache;
    private readonly CachingNutritionProxy _sut;

    public CachingProxyTests()
    {
        _innerProviderMock = new Mock<INutritionProvider>();
        
        _realCache = new MemoryCache(new MemoryCacheOptions());

        _sut = new CachingNutritionProxy(_innerProviderMock.Object, _realCache);
    }

    [Fact]
    public async Task GetProduct_ShouldCallInnerService_WhenCacheIsEmpty()
    {
        string query = "apple";
        var expectedProduct = new ProductDto { Name = "Apple", Calories = 52 };

        _innerProviderMock.Setup(x => x.GetProductAsync(query))
                          .ReturnsAsync(expectedProduct);

        var result = await _sut.GetProductAsync(query);

        result.Should().BeEquivalentTo(expectedProduct);

        _innerProviderMock.Verify(x => x.GetProductAsync(query), Times.Once);
    }

    [Fact]
    public async Task GetProduct_ShouldReturnFromCache_AndNotCallInnerService_WhenDataIsCached()
    {
        string query = "banana";
        string cacheKey = $"nutrition_{query}";
        var cachedProduct = new ProductDto { Name = "Cached Banana", Calories = 999 };

        _realCache.Set(cacheKey, cachedProduct);

        var result = await _sut.GetProductAsync(query);

        result.Name.Should().Be("Cached Banana");
        result.Calories.Should().Be(999);

        _innerProviderMock.Verify(x => x.GetProductAsync(It.IsAny<string>()), Times.Never);
    }
}