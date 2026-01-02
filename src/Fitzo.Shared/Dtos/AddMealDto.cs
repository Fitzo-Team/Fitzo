using Fitzo.Shared.Enums;

namespace Fitzo.Shared.Dtos
{
    public class AddMealDto
    {
        public Guid RecipeId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public MealType Type { get; set; }
    }
}