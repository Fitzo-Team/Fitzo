using Fitzo.Shared.Enums;
namespace Fitzo.Shared.Dtos;

public class CreateRecipeDto
{
    public string Name { get; set; }
    public List<Enum> Tags { get; set; }
}