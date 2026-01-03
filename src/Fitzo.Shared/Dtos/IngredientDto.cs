using System.ComponentModel.DataAnnotations;

namespace Fitzo.Shared.Dtos
{
    public class IngredientDto
    {
        [Required]
        public ProductDto Product {get; set;} = new();

        [Range(0, double.MaxValue)]
        public double amount {get; set;}
    }
}