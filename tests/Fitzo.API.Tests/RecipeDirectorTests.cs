using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Patterns;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using Moq;
using Xunit;

namespace Fitzo.API.Tests;

public class RecipeDirectorTests
{
    private readonly Mock<IRecipeBuilder> _builderMock;
    private readonly RecipeDirector _sut;

    public RecipeDirectorTests()
    {
        _builderMock = new Mock<IRecipeBuilder>();
        _sut = new RecipeDirector(_builderMock.Object);
    }

    [Fact]
    public void Construct_ShouldCallBuilderMethods_InCorrectOrder()
    {
        var dto = new CreateRecipeDto
        {
            Name = "Scrambled Eggs",
            ImageUrl = "eggs.jpg",
            Tags = new List<DietTag> { DietTag.Keto },
            Ingredients = new List<IngredientDto>
            {
                new IngredientDto 
                { 
                    amount = 100,
                    Product = new ProductDto 
                    { 
                        Name = "Egg",
                        Calories = 150 
                    } 
                }
            }
        };

        _builderMock.Setup(b => b.Build()).Returns(new Recipe());

        _sut.Construct(dto);

        _builderMock.Verify(x => x.Reset(), Times.Once);
        _builderMock.Verify(x => x.SetName("Scrambled Eggs"), Times.Once);
        _builderMock.Verify(x => x.SetImage("eggs.jpg"), Times.Once);
        _builderMock.Verify(x => x.SetDietTags(dto.Tags), Times.Once);

        _builderMock.Verify(x => x.AddIngredient(It.Is<IngredientDto>(i => i.Product.Name == "Egg")), Times.Once);

        _builderMock.Verify(x => x.Build(), Times.Once);
    }

    [Fact]
    public void Construct_ShouldHandleNullOptionalFields()
    {
        var dto = new CreateRecipeDto
        {
            Name = "Just Water",
            ImageUrl = null,
            Tags = null,
            Ingredients = null
        };

        _builderMock.Setup(b => b.Build()).Returns(new Recipe());

        _sut.Construct(dto);

        _builderMock.Verify(x => x.SetName("Just Water"), Times.Once);
        
        _builderMock.Verify(x => x.SetImage(It.IsAny<string>()), Times.Never);
        _builderMock.Verify(x => x.SetDietTags(It.IsAny<List<DietTag>>()), Times.Never);
        _builderMock.Verify(x => x.AddIngredient(It.IsAny<IngredientDto>()), Times.Never);
        
        _builderMock.Verify(x => x.Build(), Times.Once);
    }

    [Fact]
    public void Ingredient_CalculateCalories_ShouldReturnCorrectValue_BasedOnServingSize()
    {
        var product = new ProductDto 
        { 
            Calories = 100, 
            Protein = 20 
        };

        var ingredient = new Ingredient
        {
            Amount = 50,
            Product = product
        };

        var calories = ingredient.CalculateCalories();
        var protein = ingredient.CalculateProtein();

        Assert.Equal(50, calories);
        Assert.Equal(10, protein);
    }

    [Fact]
    public void Recipe_CalculateMacros_ShouldSumUpAllIngredients()
    {
        var recipe = new Recipe();

        recipe.AddComponent(new Ingredient 
        { 
            Amount = 100, 
            Product = new ProductDto { Calories = 200, Fat = 10 } 
        });

        recipe.AddComponent(new Ingredient 
        { 
            Amount = 100, 
            Product = new ProductDto { Calories = 150, Fat = 5 } 
        });

        var totalCals = recipe.CalculateCalories();
        var totalFat = recipe.CalculateFat();

        Assert.Equal(350, totalCals);
        Assert.Equal(15, totalFat);
    }

    [Fact]
    public void Calculate_ShouldReturnZero_WhenProductIsNull()
    {
        var ingredient = new Ingredient
        {
            Amount = 100,
            Product = null
        };

        var calories = ingredient.CalculateCalories();

        Assert.Equal(0, calories);
    }
}