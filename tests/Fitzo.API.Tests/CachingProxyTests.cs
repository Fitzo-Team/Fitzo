using Fitzo.API.Interfaces;
using Fitzo.API.Services.Proxies;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class CachingProxyTests
{
    private readonly Mock<INutritionProvider> _innerProviderMock;
    private readonly Mock<ILogger<CachingNutritionProxy>> _loggerMock;
    private readonly IMemoryCache _realCache;
    private readonly CachingNutritionProxy _sut;

    public CachingProxyTests()
    {
        _innerProviderMock = new Mock<INutritionProvider>();
        _loggerMock = new Mock<ILogger<CachingNutritionProxy>>();
        
        _realCache = new MemoryCache(new MemoryCacheOptions());

        _sut = new CachingNutritionProxy(_innerProviderMock.Object, _realCache, _loggerMock.Object);
    }

    [Fact]
    public async Task GetProduct_ShouldCallInnerService_WhenCacheIsEmpty()
    {
        string id = "off:12345";
        var expectedProduct = new ProductDto { Name = "Apple", Calories = 52 };

        _innerProviderMock.Setup(x => x.GetProductAsync(id)).ReturnsAsync(expectedProduct);

        var result = await _sut.GetProductAsync(id);

        result.Should().BeEquivalentTo(expectedProduct);
        _innerProviderMock.Verify(x => x.GetProductAsync(id), Times.Once);
    }

    [Fact]
    public async Task GetProduct_ShouldReturnFromCache_AndNotCallInnerService_WhenDataIsCached()
    {
        string id = "usda:999";
        
        string cacheKey = $"product_{id.ToLower().Trim()}"; 
        
        var cachedProduct = new ProductDto { Name = "Cached Banana", Calories = 999 };

        _realCache.Set(cacheKey, cachedProduct);

        var result = await _sut.GetProductAsync(id);

        result.Should().NotBeNull(); 
        result.Name.Should().Be("Cached Banana");
        result.Calories.Should().Be(999);

        _innerProviderMock.Verify(x => x.GetProductAsync(It.IsAny<string>()), Times.Never);
    }
}