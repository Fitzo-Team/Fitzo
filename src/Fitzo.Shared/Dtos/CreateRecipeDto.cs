using System.ComponentModel.DataAnnotations;
using Fitzo.Shared.Enums;

namespace Fitzo.Shared.Dtos
{
    public class CreateRecipeDto
    {
        [Required]
        public string Name { get; set; }

        public string? ImageUrl { get; set; }

        public List<DietTag> Tags { get; set; } = new();

        public List<IngredientDto> Ingredients { get; set; } = new();
    }
}