using Fitzo.Shared.Enums;

namespace Fitzo.API.Entities
{
    public class MealPlanEntry
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public Guid RecipeId { get; set; }
        public virtual Recipe Recipe { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public MealType Type { get; set; }

        public void MoveTo(DateTime newDate, TimeSpan newTime)
        {
            var duration = EndTime - StartTime;

            Date = newDate;
            StartTime = newTime;
            EndTime = newTime.Add(duration); 
        }
    }
}