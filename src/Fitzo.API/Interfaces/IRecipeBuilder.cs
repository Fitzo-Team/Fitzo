using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Interfaces
{
    public interface IRecipeBuilder
    {
        void Reset();
        
        void SetName(string name);
        void SetImage(string imageUrl);
        void SetDietTags(List<DietTag> tags);
        
        void AddIngredient(IngredientDto ingredientDto); 
        Recipe Build();
    }
}