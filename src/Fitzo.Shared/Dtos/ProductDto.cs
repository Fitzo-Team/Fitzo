using Fitzo.Shared.Enums;

namespace Fitzo.Shared.Dtos;
public class ProductDto
{
    public string ExternalId { get; set; }
    public string Name { get; set; }
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Fat { get; set; }
    public double Carbs { get; set; }
}