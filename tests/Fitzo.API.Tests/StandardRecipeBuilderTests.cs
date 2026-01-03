using Fitzo.API.Entities;
using Fitzo.API.Patterns;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using FluentAssertions;
using Xunit;

namespace Fitzo.API.Tests;

public class StandardRecipeBuilderTests
{
    private readonly StandardRecipeBuilder _sut;

    public StandardRecipeBuilderTests()
    {
        _sut = new StandardRecipeBuilder();
    }

    [Fact]
    public void Build_ShouldCreateRecipe_WithBasicProperties()
    {
        var name = "Keto Pancakes";
        var image = "http://img.com/pancakes.jpg";
        var tags = new List<DietTag> { DietTag.Keto, DietTag.HighProtein };

        _sut.SetName(name);
        _sut.SetImage(image);
        _sut.SetDietTags(tags);
        
        var result = _sut.Build();

        result.Should().NotBeNull();
        result.Name.Should().Be(name);
        result.ImageUrl.Should().Be(image);
        result.Tags.Should().Contain(tags);
    }

    [Fact]
    public void AddIngredient_ShouldMapDtoToEntityCorrectly()
    {
        var ingredientDto = new IngredientDto
        {
            amount = 200,
            Product = new ProductDto
            {
                ExternalId = "off:123",
                Name = "Milk",
                Calories = 50,
                Protein = 3.2,
                Carbs = 4.8,
                Fat = 2.0,
                ServingUnit = "ml"
            }
        };

        _sut.AddIngredient(ingredientDto);
        var recipe = _sut.Build();

        recipe.Components.Should().HaveCount(1);
        
        var ingredient = recipe.Components.First() as Ingredient;
        ingredient.Should().NotBeNull();

        ingredient!.Name.Should().Be("Milk"); 
        ingredient.Amount.Should().Be(200);

        ingredient.Product.Should().NotBeNull();
        ingredient.Product.Calories.Should().Be(50);
        ingredient.Product.ExternalId.Should().Be("off:123");
    }

    [Fact]
    public void Reset_ShouldClearBuilderState()
    {
        _sut.SetName("Old Recipe");
        _sut.Build();
        
        _sut.SetName("New Recipe");
        var result = _sut.Build();

        result.Name.Should().Be("New Recipe");
        result.Components.Should().BeEmpty();
    }
}