using Fitzo.Shared.Dtos;

namespace Fitzo.API.Entities
{
    public class Ingredient : RecipeComponent
    {
        public ProductDto Product { get; set; }
        public double Amount { get; set; }

        public override double CalculateCalories()
        {
            if (Product == null) return 0;
            return (Product.Calories * Amount) / 100.0;
        }

        public override double CalculateProtein()
        {
            if (Product == null) return 0;
            return (Product.Protein * Amount) / 100.0;
        }

        public override double CalculateFat()
        {
            if (Product == null) return 0;
            return (Product.Fat * Amount) / 100.0;
        }

        public override double CalculateCarbs()
        {
            if (Product == null) return 0;
            return (Product.Carbs * Amount) / 100.0;
        }
    }
}