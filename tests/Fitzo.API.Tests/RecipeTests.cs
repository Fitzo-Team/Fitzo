using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Xunit;

public class RecipeTests
{
    [Fact]
    public void CalculateCalories_ShouldReturnSumOfAllIngredients()
    {
        var recipe = new Recipe();

        var ingredient1 = new Ingredient
        {
            Amount = 100,
            Product = new ProductDto { Calories = 200 }
        };

        var ingredient2 = new Ingredient
        {
            Amount = 50,
            Product = new ProductDto { Calories = 100 }
        };

        recipe.AddComponent(ingredient1);
        recipe.AddComponent(ingredient2);

        var totalCalories = recipe.CalculateCalories();

        totalCalories.Should().Be(250);
    }

    [Fact]
    public void CalculateCalories_ShouldReturnZero_WhenNoIngredients()
    {
        var recipe = new Recipe();

        var result = recipe.CalculateCalories();

        result.Should().Be(0);
    }
}