using Fitzo.API.Entities;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Xunit;

namespace Fitzo.Tests
{
    public class ShoppingListGeneratorTests
    {
        private readonly ShoppingListGenerator _generator;

        public ShoppingListGeneratorTests()
        {
            _generator = new ShoppingListGenerator();
        }

        [Fact]
        public void Generate_ShouldSumQuantities_WhenSameProductExistsMultipleTimes()
        {
            var product = new ProductDto { ExternalId = "p1", Name = "Mleko", ServingUnit = "ml" };

            var entry1 = CreateEntryWithIngredient(product, 200);
            
            var entry2 = CreateEntryWithIngredient(product, 300);

            var plan = new List<MealPlanEntry> { entry1, entry2 };

            var result = _generator.Generate(plan);

            Assert.Single(result);
            Assert.Equal("Mleko", result[0].Name);
            Assert.Equal(500, result[0].TotalAmount);
            Assert.Equal("ml", result[0].Unit);
        }

        [Fact]
        public void Generate_ShouldHandleNestedRecipes_AndExtractDeepIngredients()
        {

            var tomatoProduct = new ProductDto { ExternalId = "t1", Name = "Pomidory", ServingUnit = "g" };
            
            var tomatoIngredient = new Ingredient 
            { 
                Product = tomatoProduct, 
                Amount = 400 
            };

            var sauceRecipe = new Recipe { Name = "Sos pomidorowy" };
            sauceRecipe.Components.Add(tomatoIngredient);

            var mainRecipe = new Recipe { Name = "Spaghetti z sosem" };
            mainRecipe.Components.Add(sauceRecipe);

            var entry = new MealPlanEntry
            {
                Recipe = mainRecipe
            };

            var result = _generator.Generate(new List<MealPlanEntry> { entry });

            Assert.Single(result);
            Assert.Equal("Pomidory", result[0].Name);
            Assert.Equal(400, result[0].TotalAmount);
        }

        [Fact]
        public void Generate_ShouldSeparateDifferentProducts()
        {
            var bread = new ProductDto { ExternalId = "b1", Name = "Chleb" };
            var butter = new ProductDto { ExternalId = "b2", Name = "Masło" };

            var entry1 = CreateEntryWithIngredient(bread, 1);
            var entry2 = CreateEntryWithIngredient(butter, 1);

            var result = _generator.Generate(new List<MealPlanEntry> { entry1, entry2 });

            Assert.Equal(2, result.Count);
            Assert.Contains(result, i => i.Name == "Chleb");
            Assert.Contains(result, i => i.Name == "Masło");
        }
        
        [Fact]
        public void Generate_ShouldReturnEmptyList_WhenInputIsEmpty()
        {
            var result = _generator.Generate(new List<MealPlanEntry>());

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        private MealPlanEntry CreateEntryWithIngredient(ProductDto product, double amount)
        {
            var recipe = new Recipe();
            recipe.Components.Add(new Ingredient
            {
                Product = product,
                Amount = amount
            });

            return new MealPlanEntry
            {
                Recipe = recipe
            };
        }
    }
}