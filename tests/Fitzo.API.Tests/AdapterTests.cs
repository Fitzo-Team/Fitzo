using System.Net;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace Fitzo.API.Tests;

public class AdaptersTests
{
    private HttpClient CreateMockHttpClient(HttpResponseMessage responseToReturn)
    {
        var handlerMock = new Mock<HttpMessageHandler>();

        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(responseToReturn);

        return new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://fake-url.com/")
        };
    }

    [Fact]
    public async Task UsdaAdapter_GetProductAsync_ShouldReturnMappedProduct_WhenApiReturnsData()
    {
        var fakeJson = """
        {
            "fdcId": 12345,
            "description": "Raw Broccoli",
            "foodNutrients": [
                { "nutrientName": "Energy", "value": 34 },
                { "nutrientName": "Protein", "value": 2.8 },
                { "nutrientName": "Carbohydrate, by difference", "value": 6.6 },
                { "nutrientName": "Total lipid (fat)", "value": 0.4 }
            ]
        }
        """;

        var response = new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = new StringContent(fakeJson)
        };

        var httpClient = CreateMockHttpClient(response);
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(x => x["UsdaApiKey"]).Returns("TEST_KEY");

        var sut = new UsdaAdapter(httpClient, configMock.Object);

        var result = await sut.GetProductAsync("12345");

        result.Should().NotBeNull();
        result!.Name.Should().Be("Raw Broccoli");
        result.Calories.Should().Be(34);
        result.Protein.Should().Be(2.8);
        result.ExternalId.Should().Be("usda:12345");
    }

    [Fact]
    public async Task UsdaAdapter_GetProductAsync_ShouldReturnNull_WhenApiReturns404()
    {
        var httpClient = CreateMockHttpClient(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.NotFound
        });

        var configMock = new Mock<IConfiguration>();
        configMock.Setup(x => x["UsdaApiKey"]).Returns("TEST_KEY");

        var sut = new UsdaAdapter(httpClient, configMock.Object);

        var result = await sut.GetProductAsync("999999");

        result.Should().BeNull();
    }

    [Fact]
    public async Task OffAdapter_GetProductAsync_ShouldReturnProduct_WhenFound()
    {
        var fakeJson = """
        {
            "product": {
                "code": "5449000000996",
                "product_name": "Coca Cola",
                "nutriments": {
                    "energy-kcal_100g": 42,
                    "carbohydrates_100g": 10.6,
                    "proteins_100g": 0,
                    "fat_100g": 0
                }
            }
        }
        """;

        var httpClient = CreateMockHttpClient(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = new StringContent(fakeJson)
        });

        var sut = new OffAdapter(httpClient);

        var result = await sut.GetProductAsync("5449000000996");

        result.Should().NotBeNull();
        result!.Name.Should().Be("Coca Cola");
        result.Calories.Should().Be(42);
        result.ExternalId.Should().Be("5449000000996");
    }

    [Fact]
    public async Task OffAdapter_GetProductAsync_ShouldReturnNull_WhenApiReturns404()
    {
        var httpClient = CreateMockHttpClient(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.NotFound
        });

        var sut = new OffAdapter(httpClient);

        var result = await sut.GetProductAsync("000000");

        result.Should().BeNull();
    }
}

public class HybridNutritionProviderTests
{
    private readonly Mock<UsdaAdapter> _usdaMock;
    private readonly Mock<OffAdapter> _offMock;
    private readonly Mock<ILogger<HybridNutritionProvider>> _loggerMock;
    private readonly HybridNutritionProvider _sut;

    public HybridNutritionProviderTests()
    {
        var dummyHttp = new HttpClient();
        var dummyConfig = new Mock<IConfiguration>();
        dummyConfig.Setup(x => x["UsdaApiKey"]).Returns("dummy");

        _usdaMock = new Mock<UsdaAdapter>(dummyHttp, dummyConfig.Object);
        _offMock = new Mock<OffAdapter>(dummyHttp);
        _loggerMock = new Mock<ILogger<HybridNutritionProvider>>();

        _sut = new HybridNutritionProvider(_usdaMock.Object, _offMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task GetProductAsync_ShouldCallOffAdapter_WhenIdStartsWithOffPrefix()
    {
        string offId = "off:5449000000996";
        var expectedProduct = new ProductDto { Name = "Coke" };

        _offMock.Setup(x => x.GetProductAsync(offId))
                .ReturnsAsync(expectedProduct);

        var result = await _sut.GetProductAsync(offId);

        result.Should().Be(expectedProduct);
        
        _offMock.Verify(x => x.GetProductAsync(offId), Times.Once);
        _usdaMock.Verify(x => x.GetProductAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetProductAsync_ShouldCallUsdaAdapter_WhenIdStartsWithUsdaPrefix()
    {
        string usdaId = "usda:12345";
        var expectedProduct = new ProductDto { Name = "Apple" };

        _usdaMock.Setup(x => x.GetProductAsync(usdaId))
                 .ReturnsAsync(expectedProduct);

        var result = await _sut.GetProductAsync(usdaId);

        result.Should().Be(expectedProduct);
        
        _usdaMock.Verify(x => x.GetProductAsync(usdaId), Times.Once);
        _offMock.Verify(x => x.GetProductAsync(It.IsAny<string>()), Times.Never);
    }
}