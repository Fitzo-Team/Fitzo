using Fitzo.Shared.Enums;

namespace Fitzo.API.Entities
{
    public class Recipe : RecipeComponent
    {
        public Guid OwnerId { get; set; }
        public string? ImageUrl { get; set; }
        public List<DietTag> Tags { get; set; } = new();

        public List<RecipeComponent> Components { get; set; } = new();

        public override double CalculateCalories()
        {
            return Components.Sum(c => c.CalculateCalories());
        }

        public void AddComponent(RecipeComponent component)
        {
            Components.Add(component);
        }

        public void RemoveComponent(RecipeComponent component)
        {
            Components.Remove(component);
        }
    }
}