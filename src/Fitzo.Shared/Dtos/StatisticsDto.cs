public class StatisticsDto
{
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
    
    public double TotalCalories { get; set; }
    public double TotalProtein { get; set; }
    public double TotalFat { get; set; }
    public double TotalCarbs { get; set; }
    
    public double AverageDailyCalories { get; set; }
    public double AverageWeeklyCalories { get; set; }
}