using System.Security.Claims;
using Fitzo.API.Data;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly FitzoDbContext context;

    public StatsController(FitzoDbContext _context)
    {
        context = _context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserStatistics()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var today = DateTime.UtcNow.Date;
        var sevenDaysAgo = today.AddDays(-6);
        var thirtyDaysAgo = today.AddDays(-29);

        var recipesCount = await context.Recipes.CountAsync();
        var ingredientsCount = await context.ingredients.CountAsync();

        var rawEntries = await context.FoodEntries
            .Include(e => e.ProductEntry)
            .Where(e => e.UserId == userId && e.Date >= thirtyDaysAgo)
            .ToListAsync();

        var foodEntries = rawEntries.Select(e => new 
        {
            Date = e.Date.Date,
            Calories = e.ProductEntry != null ? (e.ProductEntry.Calories * e.Amount) / 100.0 : 0,
            Protein = e.ProductEntry != null ? (e.ProductEntry.Protein * e.Amount) / 100.0 : 0,
            Fat = e.ProductEntry != null ? (e.ProductEntry.Fat * e.Amount) / 100.0 : 0,
            Carbs = e.ProductEntry != null ? (e.ProductEntry.Carbs * e.Amount) / 100.0 : 0,
            Category = e.ProductEntry != null ? e.ProductEntry.Category : FoodCategories.Unknown
        }).ToList();

        var weightEntries = await context.WeightEntries
            .Where(w => w.UserId == userId)
            .OrderBy(w => w.Date)
            .ToListAsync();

        var last7DaysFood = foodEntries.Where(x => x.Date >= sevenDaysAgo).ToList();
        
        var totalCalsWeek = last7DaysFood.Sum(x => x.Calories);
        var avgWeek = totalCalsWeek > 0 ? totalCalsWeek / 7.0 : 0;

        var totalCalsMonth = foodEntries.Sum(x => x.Calories);
        var avgMonth = totalCalsMonth > 0 ? totalCalsMonth / 30.0 : 0;

        var weeklySummary = last7DaysFood
            .GroupBy(x => x.Date)
            .Select(g => new DailySummaryDto
            {
                Date = g.Key,
                TotalCalories = Math.Round(g.Sum(x => x.Calories), 0),
                TotalProtein = Math.Round(g.Sum(x => x.Protein), 1),
                TotalFat = Math.Round(g.Sum(x => x.Fat), 1),
                TotalCarbs = Math.Round(g.Sum(x => x.Carbs), 1)
            })
            .ToList();

        for (int i = 0; i < 7; i++)
        {
            var dayToCheck = sevenDaysAgo.AddDays(i);
            if (!weeklySummary.Any(d => d.Date == dayToCheck))
            {
                weeklySummary.Add(new DailySummaryDto 
                { 
                    Date = dayToCheck, 
                    TotalCalories = 0, 
                    TotalProtein = 0, 
                    TotalFat = 0, 
                    TotalCarbs = 0 
                });
            }
        }
        weeklySummary = weeklySummary.OrderBy(x => x.Date).ToList();

        var categorySummary = foodEntries
            .GroupBy(x => x.Category)
            .Select(g => new CategorySummaryDto
            {
                CategoryName = g.Key.ToString(),
                Totalcalories = Math.Round(g.Sum(x => x.Calories), 0),
                Percentage = totalCalsMonth > 0 
                    ? Math.Round((g.Sum(x => x.Calories) / totalCalsMonth) * 100, 1) 
                    : 0
            })
            .Where(x => x.Totalcalories > 0)
            .OrderByDescending(x => x.Totalcalories)
            .ToList();

        double currentWeight = 0;
        double weightChangeMonth = 0;
        var weightHistoryDto = new List<WeightHistoryDto>();

        if (weightEntries.Any())
        {
            currentWeight = weightEntries.Last().Value;

            weightHistoryDto = weightEntries
                .Select(w => new WeightHistoryDto
                {
                    Date = w.Date,
                    Weight = w.Value
                })
                .ToList();

            var targetDate = today.AddDays(-30);
            
            var pastEntry = weightEntries
                .Where(w => w.Date <= targetDate && w.Date >= targetDate.AddDays(-15)) 
                .OrderByDescending(w => w.Date)
                .FirstOrDefault();

            if (pastEntry == null && weightEntries.First().Date < today.AddDays(-7))
            {
                pastEntry = weightEntries.First();
            }

            if (pastEntry != null)
            {
                weightChangeMonth = Math.Round(currentWeight - pastEntry.Value, 1);
            }
        }

        var result = new UserStatsDto
        {
            TotalRecipesCount = recipesCount,
            TotalIngredientCount = ingredientsCount,

            AverageDailyCaloriesWeek = Math.Round(avgWeek, 0),
            AverageDailyCaloriesMonth = Math.Round(avgMonth, 0),
            
            WeeklySummary = weeklySummary,
            CategoryBreakdown = categorySummary,

            CurrentWeight = currentWeight,
            WeightChangeMonth = weightChangeMonth,
            WeightHistory = weightHistoryDto
        };

        return Ok(result);
    }
}