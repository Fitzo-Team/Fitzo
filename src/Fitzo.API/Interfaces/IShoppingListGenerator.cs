using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Interfaces
{
    public interface IShoppingListGenerator
    {
        List<ShoppingListItem> Generate(List<MealPlanEntry> mealPlanEntries);
    }
}