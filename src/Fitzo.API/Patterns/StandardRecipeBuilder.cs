using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Patterns
{
    public class StandardRecipeBuilder : IRecipeBuilder
    {
        private Recipe _recipe = new();

        public StandardRecipeBuilder()
        {
            Reset();
        }

        public void Reset()
        {
            _recipe = new Recipe();
        }

        public void SetName(string name)
        {
            _recipe.Name = name;
        }

        public void SetImage(string imageUrl)
        {
            _recipe.ImageUrl = imageUrl;
        }

        public void SetDietTags(List<DietTag> tags)
        {
            if (tags != null)
            {
                _recipe.Tags.AddRange(tags);
            }
        }

        public void AddIngredient(IngredientDto ingredientDto)
        {
            var ingredient = new Ingredient
            {
                Name = ingredientDto.ProductName,
                Amount = ingredientDto.Amount,
                Product = new ProductDto 
                { 
                    Name = ingredientDto.ProductName,
                    Calories = ingredientDto.Calories,
                    Protein = ingredientDto.Protein,
                    Carbs = ingredientDto.Carbs,
                    Fat = ingredientDto.Fat
                }
            };

            _recipe.AddComponent(ingredient);
        }

        public Recipe Build()
        {
            var result = _recipe;
            Reset();
            return result;
        }
    }
}