using System.ComponentModel.DataAnnotations;

namespace Fitzo.Shared.Dtos
{
    public class IngredientDto
    {
        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public double Amount { get; set; }
        public double Calories { get; set; }
        public double Protein { get; set; }
        public double Carbs { get; set; }
        public double Fat { get; set; }
    }
}