using System.Diagnostics.CodeAnalysis;
namespace Fitzo.Shared.Dtos;

[ExcludeFromCodeCoverage]
public class IngredientDto
{
    public ProductDto Product { get; set; }
    public double Amount { get; set; }
}