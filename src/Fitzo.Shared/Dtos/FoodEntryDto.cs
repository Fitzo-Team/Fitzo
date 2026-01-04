using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;

namespace Fitzo.Shared.Dtos;
public class AddFoodEntryDto
{
    public DateTime Date { get; set; }
    public MealType MealType { get; set; }
    public ProductDto? Product { get; set; }
    public Guid? RecipeId { get; set; }
    public double Amount { get; set; }
}