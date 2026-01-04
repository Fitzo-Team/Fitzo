using System.Text;
using Fitzo.API.Entities;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Xunit;

namespace Fitzo.Tests.Services;

public class ExportImportServiceTests
{
    private readonly ExportImportService _service;

    public ExportImportServiceTests()
    {
        _service = new ExportImportService();
    }

    [Fact]
    public void ExportRecipeJSON_ShouldReturnNotEmptyBytes_WhenListIsNotEmpty()
    {
        var recipes = new List<Recipe>
        {
            new Recipe 
            { 
                Name = "Jajecznica", 
                Description = "Pyszna",
                Components = new List<RecipeComponent>() 
            }
        };

        var result = _service.ExportRecipeJSON(recipes);

        Assert.NotNull(result);
        Assert.NotEmpty(result);

        var jsonString = Encoding.UTF8.GetString(result);
        Assert.Contains("Jajecznica", jsonString);
        Assert.Contains("Description", jsonString);
    }

    [Fact]
    public void ExportRecipeJSON_ShouldHandleEmptyList()
    {
        var recipes = new List<Recipe>();

        var result = _service.ExportRecipeJSON(recipes);

        var jsonString = Encoding.UTF8.GetString(result);
        Assert.Contains("[]", jsonString.Trim()); 
    }

    [Fact]
    public void ExportRecipeJSON_ShouldIncludeComponents()
    {
        var recipes = new List<Recipe>
        {
            new Recipe 
            { 
                Name = "Owsianka", 
                Components = new List<RecipeComponent>
                {
                    new Ingredient { Product = new ProductDto { Name = "Płatki" }, Amount = 50 } 
                }
            }
        };

        var result = _service.ExportRecipeJSON(recipes);
        var jsonString = Encoding.UTF8.GetString(result);

        Assert.Contains("Płatki", jsonString);
        Assert.Contains("50", jsonString);
    }

    [Fact]
    public void ImportFromJSON_ShouldReturnRecipes_WhenJsonIsValid()
    {
        var json = @"
        [
            {
                ""Name"": ""Kurczak z ryżem"",
                ""Description"": ""Klasyk"",
                ""Components"": []
            }
        ]";
        
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));

        var result = _service.ImportFromJSON(stream);

        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("Kurczak z ryżem", result.First().Name);
    }

    [Fact]
    public void ImportFromJSON_ShouldBeCaseInsensitive()
    {
        var json = @"
        [
            {
                ""name"": ""Pizza"",
                ""description"": ""Cheat meal""
            }
        ]";
        
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));

        var result = _service.ImportFromJSON(stream);

        var recipe = result.First();
        Assert.Equal("Pizza", recipe.Name);
    }

    [Fact]
    public void ImportFromJSON_ShouldHandleNestedComponents()
    {
    var json = @"
    [
        {
            ""$type"": ""Recipe"",
            ""Name"": ""Kanapka"",
            ""Components"": [
                {
                    ""$type"": ""Ingredient"", 
                    ""Amount"": 100,
                    ""Product"": { ""Name"": ""Chleb"" }
                }
            ]
        }
    ]";
    
    var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));

    var result = _service.ImportFromJSON(stream);

    var recipe = result.First();
    Assert.Single(recipe.Components);

    var ingredient = recipe.Components.First() as Ingredient;
    
    Assert.NotNull(ingredient);
    Assert.Equal(100, ingredient.Amount);
    }

    [Fact]
    public void ImportFromJSON_ShouldReturnEmptyList_WhenInputIsEmptyArray()
    {
        var json = "[]";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));

        var result = _service.ImportFromJSON(stream);

        Assert.NotNull(result);
        Assert.Empty(result);
    }
}