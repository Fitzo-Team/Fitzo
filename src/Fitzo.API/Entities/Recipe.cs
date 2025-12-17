namespace Fitzo.API.Entities;

public class Recipe
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public int OwnerId { get; set; } 
}
