using Fitzo.API.Entities;
using Fitzo.API.Patterns;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using FluentAssertions;
using Xunit;

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
        result.Tags.Should().HaveCount(2);
    }

    [Fact]
    public void AddIngredient_ShouldMapDtoToEntityCorrectly()
    {
        var ingredientDto = new IngredientDto
        {
            ProductName = "Almond Flour",
            Amount = 100,
            Calories = 600,
            Protein = 20,
            Carbs = 10,
            Fat = 50
        };

        _sut.AddIngredient(ingredientDto);
        var result = _sut.Build();

        result.Components.Should().HaveCount(1);
        
        var addedIngredient = result.Components.First() as Ingredient;
        
        addedIngredient.Should().NotBeNull();
        addedIngredient!.Name.Should().Be("Almond Flour");
        addedIngredient.Amount.Should().Be(100);
        
        addedIngredient.Product.Should().NotBeNull();
        addedIngredient.Product.Name.Should().Be("Almond Flour");
        addedIngredient.Product.Calories.Should().Be(600);
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