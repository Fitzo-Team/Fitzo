namespace Fitzo.Shared.Dtos;

public class UserStatsDto
{
    public int TotalRecipesCount {get; set;}
    public int TotalIngredientCount {get; set;}
    public double AverageDailyCaloriesWeek {get; set;}
    public double AverageDailyCaloriesMonth {get; set;}
    public List<DailySummaryDto> WeeklySummary {get; set;} = new List<DailySummaryDto>();
    public List<CategorySummaryDto> CategoryBreakdown {get; set;} = new List<CategorySummaryDto>();
    public double CurrentWeight { get; set; }
    public double WeightChangeMonth { get; set; }
    public List<WeightHistoryDto> WeightHistory { get; set; } = new();
}

public class DailySummaryDto
{
    public DateTime Date {get; set;}
    public double TotalCalories {get; set;}
    public double TotalProtein {get; set;}
    public double TotalCarbs {get; set;}
    public double TotalFat {get; set;}
}

public class CategorySummaryDto{
    public string CategoryName {get; set;}
    public double Totalcalories {get; set;}
    public double Percentage {get; set;}
}

public class WeightHistoryDto
{
    public DateTime Date { get; set; }
    public double Weight { get; set; }
}