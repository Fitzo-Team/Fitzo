namespace Fitzo.Shared.Dtos;

public class ProductSearchFilterDto
{
    public string? Query {get; set;}
    public string? Category {get; set;}
    public string? Nutriscore {get; set;}
    public bool NoPalmOil {get; set;}
    public bool Vegetarian {get; set;}
    public bool Vegan {get; set;}

    public int Page {get; set;} = 1;
    public int PageSize {get; set;} = 20;

    public bool HasAdvancedFilters => NoPalmOil || Vegetarian || Vegan 
    || !string.IsNullOrWhiteSpace(Category) 
    || !string.IsNullOrWhiteSpace(Nutriscore);
}