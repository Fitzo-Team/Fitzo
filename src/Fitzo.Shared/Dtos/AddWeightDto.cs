namespace Fitzo.Shared.Dtos;

public class AddWeightDto
{
    public double Weight { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}