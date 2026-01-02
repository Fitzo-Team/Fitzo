using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

public class CalendarServiceTests
{
    private FitzoDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FitzoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new FitzoDbContext(options);
    }

    [Fact]
    public async Task AddMealAsync_ShouldAddEntryToDatabase_WhenRecipeExists()
    {
        var context = GetInMemoryDbContext();
        var userId = Guid.NewGuid();
        
        var userContextMock = Substitute.For<IUserContextService>();
        userContextMock.GetCurrentUserId().Returns(userId);

        var recipe = new Recipe { Name = "Test Recipe", OwnerId = userId };
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        var service = new CalendarService(context, userContextMock);

        var dto = new AddMealDto
        {
            RecipeId = recipe.Id,
            Date = DateTime.Today,
            StartTime = new TimeSpan(8, 0, 0),
            EndTime = new TimeSpan(8, 30, 0),
            Type = MealType.Breakfast
        };

        await service.AddMealAsync(dto);

        var entry = await context.MealPlans.FirstOrDefaultAsync();
        entry.Should().NotBeNull();
        entry!.RecipeId.Should().Be(recipe.Id);
        entry.UserId.Should().Be(userId);
        entry.Type.Should().Be(MealType.Breakfast);
    }

    [Fact]
    public async Task AddMealAsync_ShouldThrow_WhenRecipeDoesNotExist()
    {
        var context = GetInMemoryDbContext();
        var userContextMock = Substitute.For<IUserContextService>();
        
        var service = new CalendarService(context, userContextMock);

        var dto = new AddMealDto
        {
            RecipeId = Guid.NewGuid(),
            Date = DateTime.Today
        };

        var action = async () => await service.AddMealAsync(dto);

        await action.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*nie istnieje*");
    }

    [Fact]
    public async Task GetWeeklyPlanAsync_ShouldReturnOnlyUserMeals_InDateRange()
    {
        var context = GetInMemoryDbContext();
        var myUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var userContextMock = Substitute.For<IUserContextService>();
        userContextMock.GetCurrentUserId().Returns(myUserId);

        var recipe = new Recipe { Name = "Owsianka" };
        context.Recipes.Add(recipe);

        context.MealPlans.Add(new MealPlanEntry 
        { 
            UserId = myUserId, 
            Recipe = recipe, 
            Date = DateTime.Today,
            StartTime = TimeSpan.FromHours(8)
        });


        context.MealPlans.Add(new MealPlanEntry 
        { 
            UserId = myUserId, 
            Recipe = recipe, 
            Date = DateTime.Today.AddYears(1) 
        });

        context.MealPlans.Add(new MealPlanEntry 
        { 
            UserId = otherUserId, 
            Recipe = recipe, 
            Date = DateTime.Today 
        });

        await context.SaveChangesAsync();

        var service = new CalendarService(context, userContextMock);

        var start = DateTime.Today;
        var end = DateTime.Today.AddDays(7);
        var result = await service.GetWeeklyPlanAsync(start, end);

        result.Should().HaveCount(1);
        result.First().Recipe.Name.Should().Be("Owsianka");
    }
}