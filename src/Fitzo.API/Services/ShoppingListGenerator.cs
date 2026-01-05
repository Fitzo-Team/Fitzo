using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Services
{
    public class ShoppingListGenerator : IShoppingListGenerator
    {
        public List<ShoppingListItem> Generate(List<MealPlanEntry> mealPlanEntries)
        {
            var allIngredients = new List<Ingredient>();

            foreach (var entry in mealPlanEntries)
            {
                if (entry.Recipe != null)
                {
                    CollectIngredients(entry.Recipe, allIngredients);
                }
            }

            var groupedItems = allIngredients
                .Where(i => i.Product != null)
                .GroupBy(i => !string.IsNullOrEmpty(i.Product.ExternalId) 
                              ? i.Product.ExternalId 
                              : i.Product.Name)
                .Select(g => new ShoppingListItem
                {
                    ProductId = g.Key,
                    Name = g.First().Product.Name,
                    Unit = g.First().Product.ServingUnit ?? "g",
                    Category = g.First().Product.Category.ToString(),
                    
                    TotalAmount = g.Sum(i => i.Amount)
                })
                .OrderBy(i => i.Category)
                .ThenBy(i => i.Name)
                .ToList();

            return groupedItems;
        }

        private void CollectIngredients(Recipe recipe, List<Ingredient> collector)
        {
            if (recipe.Components == null) return;

            foreach (var component in recipe.Components)
            {
                if (component is Ingredient ingredient)
                {
                    collector.Add(ingredient);
                }
                else if (component is Recipe subRecipe)
                {
                    CollectIngredients(subRecipe, collector);
                }
            }
        }
    }
}