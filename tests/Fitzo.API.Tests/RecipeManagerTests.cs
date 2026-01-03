using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

public class RecipeManagerTests
{
    private FitzoDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FitzoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new FitzoDbContext(options);
    }

    [Fact]
    public async Task CreateRecipeAsync_ShouldAddRecipeToDatabase()
    {
        using var context = GetInMemoryDbContext();
        var manager = new RecipeManager(context);
        
        var recipe = new Recipe { Name = "Test", OwnerId = Guid.NewGuid() };

        await manager.CreateRecipeAsync(recipe);

        var saved = await context.Recipes.FirstOrDefaultAsync();
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Test");
    }

    [Fact]
    public async Task GetRecipeByIdAsync_ShouldIncludeComponents()
    {
        using var context = GetInMemoryDbContext();
        var manager = new RecipeManager(context);
        var id = Guid.NewGuid();

        var recipe = new Recipe 
        { 
            Id = id, 
            Name = "Complex", 
            OwnerId = Guid.NewGuid() 
        };
        recipe.AddComponent(new Ingredient 
        { 
            Name = "Salt", 
            Amount = 10,
            Product = new ProductDto 
            { 
                ExternalId = "12345",
                Name = "Salt", 
                Calories = 0,
                Protein = 0,
                Carbs = 0,
                Fat = 0,
                
                ServingUnit = "g",
                ServingSize = 100
            }
        });

        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        context.ChangeTracker.Clear(); 

        var result = await manager.GetRecipeByIdAsync(id);

        result.Should().NotBeNull();
        
        result!.Components.Should().HaveCount(1);
        
        result.Components.First().Should().BeOfType<Ingredient>();
        
        var ingredient = result.Components.First() as Ingredient;
        ingredient!.Product.Name.Should().Be("Salt");
    }
}