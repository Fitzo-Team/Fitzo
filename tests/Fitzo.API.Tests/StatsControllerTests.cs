using Fitzo.API.Controllers;
using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Fitzo.Tests.Controllers;

public class StatsControllerTests
{
    [Fact]
public async Task GetUserStatistics_ShouldCalculateAveragesAndWeightChangeCorrectly()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = TestHelper.GetInMemoryDbContext(dbName);
        var userId = Guid.NewGuid();

        ProductDto GetTestProduct() => new ProductDto 
        { 
            Calories = 100, 
            Protein = 10, 
            Fat = 0, 
            Carbs = 0, 
            Category = FoodCategories.Grains, 
            ServingUnit = "g" 
        };
        
        context.FoodEntries.Add(new FoodEntry 
        { 
            UserId = userId, 
            Date = DateTime.UtcNow.AddDays(-1), 
            Amount = 200, 
            ProductEntry = GetTestProduct()
        });

        context.FoodEntries.Add(new FoodEntry 
        { 
            UserId = userId, 
            Date = DateTime.UtcNow.AddDays(-3), 
            Amount = 500, 
            ProductEntry = GetTestProduct()
        });

        context.FoodEntries.Add(new FoodEntry 
        { 
            UserId = userId, 
            Date = DateTime.UtcNow.AddDays(-40), 
            Amount = 1000, 
            ProductEntry = GetTestProduct()
        });

        context.WeightEntries.Add(new WeightEntry { UserId = userId, Date = DateTime.UtcNow, Value = 80 });
        context.WeightEntries.Add(new WeightEntry { UserId = userId, Date = DateTime.UtcNow.AddDays(-30), Value = 85 });

        await context.SaveChangesAsync();

        context.ChangeTracker.Clear(); 

        var controller = new StatsController(context);
        TestHelper.SimulateUser(controller, userId);

        var actionResult = await controller.GetUserStatistics();

        var okResult = Assert.IsType<OkObjectResult>(actionResult);
        var stats = Assert.IsType<UserStatsDto>(okResult.Value);

        Assert.Equal(100, stats.AverageDailyCaloriesWeek); 

        Assert.Equal(80, stats.CurrentWeight);
        Assert.Equal(-5.0, stats.WeightChangeMonth);

        Assert.Equal(2, stats.WeightHistory.Count);
    }

    [Fact]
    public async Task GetUserStatistics_ShouldReturnZeros_WhenNoDataExists()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = TestHelper.GetInMemoryDbContext(dbName);
        var userId = Guid.NewGuid();

        var controller = new StatsController(context);
        TestHelper.SimulateUser(controller, userId);

        var actionResult = await controller.GetUserStatistics();

        var okResult = Assert.IsType<OkObjectResult>(actionResult);
        var stats = Assert.IsType<UserStatsDto>(okResult.Value);

        Assert.Equal(0, stats.AverageDailyCaloriesWeek);
        Assert.Equal(0, stats.CurrentWeight);
        Assert.Equal(0, stats.WeightChangeMonth);
        Assert.Empty(stats.WeightHistory);
        Assert.Equal(7, stats.WeeklySummary.Count);
    }
}