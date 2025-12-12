namespace Fitzo.API.Services;

public class UsdaSearchResult
{
    public int TotalHits { get; set; }
    public List<UsdaFoodItem> Foods { get; set; } = new();
}
public class UsdaFoodItem
{
    public int FdcId { get; set; }
    public string Description { get; set; }
    public string BrandName { get; set; }
    public List<UsdaNutrient> FoodNutrients { get; set; } = new();
}
public class UsdaNutrient
{
    public string NutrientName { get; set; }
    public double Value { get; set; }
    public string UnitName { get; set; }
}