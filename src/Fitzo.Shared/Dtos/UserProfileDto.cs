using Fitzo.Shared.Enums;

namespace Fitzo.Shared.Dtos;

public class UserProfileDto
{
    public double Weight { get; set; }
    public double Height { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public string? ImageUrl { get; set; }
}