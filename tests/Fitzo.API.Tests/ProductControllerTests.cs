using Fitzo.API.Controllers;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
namespace Fitzo.API.Tests;

public class ProductControllerTests
{
    private readonly Mock<INutritionProvider> nutritionProviderMock;
    private readonly ProductController controller;

    public ProductControllerTests()
    {
        nutritionProviderMock = new Mock<INutritionProvider>();
        controller = new ProductController(nutritionProviderMock.Object);
    }

    [Fact]
    public async Task GetProduct_ShouldReturnOk_WhenProductExists()
    {
        var query = "apple";
        var expectedProduct = new ProductDto { Name= "Apple", Calories=52};

        nutritionProviderMock.Setup(x => x.GetProductAsync(query)).ReturnsAsync(expectedProduct);

        var result = await controller.GetProduct(query);

        var actionResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedProduct = actionResult.Value.Should().BeOfType<ProductDto>().Subject;

        returnedProduct.Name.Should().Be("Apple");
        returnedProduct.Calories.Should().Be(52);
    }

    [Fact]
    public async Task GetProduct_ShouldReturnNotFound_WhenProductDoesNotExist()
    {
        var query = "niesniejace_cos";

        nutritionProviderMock.Setup(x => x.GetProductAsync(query)).ReturnsAsync((ProductDto)null);

        var result = await controller.GetProduct(query);

        result.Should().BeOfType<NotFoundObjectResult>();
    }
}
