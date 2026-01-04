using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using Xunit;

namespace Fitzo.Tests.Entities;

public class FoodEntryTests
{
    [Fact]
    public void CalculateCalories_ShouldReturnCorrectValue_BasedOnAmount()
    {
        var entry = new FoodEntry
        {
            Amount = 50,
            ProductEntry = new ProductDto
            {
                Calories = 200,
                Protein = 10,
                Fat = 5,
                Carbs = 20
            }
        };

        var result = entry.CalculateCalories();

        Assert.Equal(100, result);
    }

    [Fact]
    public void CalculateMacros_ShouldCalculateProportionally()
    {
        var entry = new FoodEntry
        {
            Amount = 200,
            ProductEntry = new ProductDto
            {
                Calories = 100,
                Protein = 10,
                Fat = 5,
                Carbs = 50
            }
        };

        Assert.Equal(20, entry.CalculateProtein());
        Assert.Equal(10, entry.CalculateFat());
        Assert.Equal(100, entry.CalculateCarbs());
    }
}