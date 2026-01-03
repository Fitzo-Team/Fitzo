namespace Fitzo.API.Entities
{
    public abstract class RecipeComponent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public abstract double CalculateCalories();
        public abstract double CalculateProtein();
        public abstract double CalculateFat();
        public abstract double CalculateCarbs();
    }
}