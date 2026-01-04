using Fitzo.Shared.Enums;
using System.Diagnostics.CodeAnalysis;

namespace Fitzo.Shared.Dtos;
public class ProductDto
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? brand {get; set;}
    public string? ImageUrl {get; set;}

    
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Fat { get; set; }
    public double Carbs { get; set; }
    public FoodCategories Category {get; set;} = FoodCategories.Unknown;

    public double? ServingSize {get; set;}
    public string ServingUnit {get; set;}

    public string? NutriScore { get; set; }
    public string? EcoScore { get; set; }

    public bool? HasPalmOil {get; set;}

    public List<string> labels {get; set;} = new();
    public List<string> Allergens {get; set;} = new();

    public List<string> DataQualityMessages {get; set;} = new();

    public bool IsDataComplete {get; set;} = true;
}