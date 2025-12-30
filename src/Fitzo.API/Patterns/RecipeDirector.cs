using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Fitzo.API.Entities;

namespace Fitzo.API.Patterns
{
    public class RecipeDirector
    {
        private readonly IRecipeBuilder _builder;

        public RecipeDirector(IRecipeBuilder builder)
        {
            _builder = builder;
        }

        public Recipe Construct(CreateRecipeDto dto)
        {
            _builder.Reset();
            
            _builder.SetName(dto.Name);
            
            if (!string.IsNullOrEmpty(dto.ImageUrl))
            {
                _builder.SetImage(dto.ImageUrl);
            }

            if (dto.Tags != null)
            {
                _builder.SetDietTags(dto.Tags);
            }

            if (dto.Ingredients != null)
            {
                foreach (var ingredientDto in dto.Ingredients)
                {
                    _builder.AddIngredient(ingredientDto);
                }
            }

            return _builder.Build();
        }
    }
}