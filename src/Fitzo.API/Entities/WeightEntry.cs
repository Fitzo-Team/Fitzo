namespace Fitzo.API.Entities;

public class WeightEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public double Value { get; set; }
}