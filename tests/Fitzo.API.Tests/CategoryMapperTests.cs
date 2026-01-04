using Fitzo.API.Services;
using Fitzo.Shared.Enums;
using FluentAssertions;
using Ftizo.API.Services;
using Xunit;

namespace Fitzo.API.Tests;

public class CategoryMapperTests
{
    [Theory]
    [InlineData("en:fresh-vegetables", FoodCategories.Vegetables)]
    [InlineData("fr:pommes-de-terre", FoodCategories.Unknown)]
    [InlineData("en:plant-based-foods", FoodCategories.Vegetables)]
    public void MapFromOffTags_ShouldMapVegetables(string tag, FoodCategories expected)
    {
        var tags = new List<string> { tag, "en:some-random-tag" };
        var result = CategoryMapper.MapFromOffTags(tags);
        result.Should().Be(expected);
    }

    [Fact]
    public void MapFromOffTags_ShouldReturnDairy_WhenTagsContainMilkOrCheese()
    {
        var tags = new List<string> { "en:fermented-foods", "en:dairies", "en:yogurts" };

        var result = CategoryMapper.MapFromOffTags(tags);

        result.Should().Be(FoodCategories.Dairy);
    }

    [Fact]
    public void MapFromOffTags_ShouldReturnUnknown_WhenListIsNullorEmpty()
    {
        CategoryMapper.MapFromOffTags(null).Should().Be(FoodCategories.Unknown);
        CategoryMapper.MapFromOffTags(new List<string>()).Should().Be(FoodCategories.Unknown);
    }

    [Theory]
    [InlineData("Dairy and Egg Products", FoodCategories.Dairy)]
    [InlineData("Vegetables and Vegetable Products", FoodCategories.Vegetables)]
    [InlineData("Fruits and Fruit Juices", FoodCategories.Fruits)]
    [InlineData("Poultry Products", FoodCategories.Meat)]
    [InlineData("Beef Products", FoodCategories.Meat)]
    [InlineData("Baked Products", FoodCategories.Grains)]
    [InlineData("Breakfast Cereals", FoodCategories.Grains)]
    [InlineData("Fats and Oils", FoodCategories.Fats)]
    [InlineData("Nut and Seed Products", FoodCategories.NutsAndSeeds)]
    [InlineData("Beverages", FoodCategories.Beverages)]
    [InlineData("Sweets", FoodCategories.Sweets)]
    public void MapFromUsdaCategory_ShouldMapCorrectly(string usdaCategory, FoodCategories expected)
    {
        var result = CategoryMapper.MapFromUsdaTags(usdaCategory);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public void MapFromUsdaCategory_ShouldReturnUnknown_OnEmptyInput(string input)
    {
        CategoryMapper.MapFromUsdaTags(input).Should().Be(FoodCategories.Unknown);
    }

    [Fact]
    public void MapFromUsdaCategory_ShouldBeCaseInsensitive()
    {
        var result = CategoryMapper.MapFromUsdaTags("vEgEtAbLeS");
        result.Should().Be(FoodCategories.Vegetables);
    }
}