using System.Net;
using System.Text.Json;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
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
            "foods": [
                {
                    "description": "Raw Broccoli",
                    "foodNutrients": [
                        { "nutrientName": "Energy", "value": 34 },
                        { "nutrientName": "Protein", "value": 2.8 },
                        { "nutrientName": "Carbohydrate, by difference", "value": 6.6 },
                        { "nutrientName": "Total lipid (fat)", "value": 0.4 }
                    ]
                }
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

        var result = await sut.GetProductAsync("Broccoli");

        result.Should().NotBeNull();
        result.Name.Should().Be("Raw Broccoli");
        result.Calories.Should().Be(34);
        result.Protein.Should().Be(2.8);
    }

    [Fact]
    public async Task UsdaAdapter_GetProductAsync_ShouldReturnNull_WhenApiReturnsEmptyList()
    {
        var fakeJson = """{ "foods": [] }""";
        var httpClient = CreateMockHttpClient(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = new StringContent(fakeJson)
        });

        var configMock = new Mock<IConfiguration>();
        configMock.Setup(x => x["UsdaApiKey"]).Returns("TEST_KEY");

        var sut = new UsdaAdapter(httpClient, configMock.Object);

        var result = await sut.GetProductAsync("UnknownThing");

        result.Should().BeNull();
    }

    // [Fact]
    // public async Task OffAdapter_GetProductAsync_ShouldReturnProduct_WhenFound()
    // {
    //     var fakeJson = """
    //     {
    //         "product": {
    //             "product_name": "Coca Cola",
    //             "nutriments": {
    //                 "energy-kcal": 42,
    //                 "carbohydrates_100g": 10.6,
    //                 "proteins_100g": 0,
    //                 "fat_100g": 0
    //             }
    //         }
    //     }
    //     """;

    //     var httpClient = CreateMockHttpClient(new HttpResponseMessage
    //     {
    //         StatusCode = HttpStatusCode.OK,
    //         Content = new StringContent(fakeJson)
    //     });

    //     var sut = new OffAdapter(httpClient);

    //     var result = await sut.GetProductAsync("123456789");

    //     result.Should().NotBeNull();
    //     result.Name.Should().Be("Coca Cola");
    //     result.Calories.Should().Be(42);
    // }

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
    private readonly HybridNutritionProvider _sut;

    public HybridNutritionProviderTests()
    {
        var dummyHttp = new HttpClient();
        var dummyConfig = new Mock<IConfiguration>();
        dummyConfig.Setup(x => x["UsdaApiKey"]).Returns("dummy");

        _usdaMock = new Mock<UsdaAdapter>(dummyHttp, dummyConfig.Object);
        _offMock = new Mock<OffAdapter>(dummyHttp);

        _sut = new HybridNutritionProvider(_usdaMock.Object, _offMock.Object);
    }

    [Fact]
    public async Task GetProductAsync_ShouldCallOffAdapter_WhenQueryIsNumericBarcode()
    {
        string barcode = "590000123";
        var expectedProduct = new ProductDto { Name = "Barcoded Product" };

        _offMock.Setup(x => x.GetProductAsync(barcode))
                .ReturnsAsync(expectedProduct);

        var result = await _sut.GetProductAsync(barcode);

        result.Should().Be(expectedProduct);
        
        _offMock.Verify(x => x.GetProductAsync(barcode), Times.Once);
        _usdaMock.Verify(x => x.GetProductAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetProductAsync_ShouldCallUsdaAdapter_WhenQueryIsText()
    {
        string query = "Apple Pie";
        var expectedProduct = new ProductDto { Name = "Apple Pie" };

        _usdaMock.Setup(x => x.GetProductAsync(query))
                .ReturnsAsync(expectedProduct);

        var result = await _sut.GetProductAsync(query);

        result.Should().Be(expectedProduct);
        _usdaMock.Verify(x => x.GetProductAsync(query), Times.Once);
        _offMock.Verify(x => x.GetProductAsync(It.IsAny<string>()), Times.Never);
    }
}