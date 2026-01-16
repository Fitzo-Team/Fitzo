using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;  
using Fitzo.API.Data;
using FluentAssertions;
namespace Fitzo.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PlanningController : ControllerBase
    {
        private readonly CalendarService _calendarService;
        private readonly IShoppingListGenerator _shoppingListGenerator;
        private readonly FitzoDbContext _context;
        private readonly ILogger<PlanningController> _logger;

        public PlanningController(
            CalendarService calendarService, 
            IShoppingListGenerator shoppingListGenerator, 
            FitzoDbContext context,
            ILogger<PlanningController> logger)
        {
            _calendarService = calendarService;
            _shoppingListGenerator = shoppingListGenerator;
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AddMeal([FromBody] AddMealDto dto)
        {
            try
            {
                await _calendarService.AddMealAsync(dto);
                return Ok(new { message = "Posiłek został dodany do planu." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeeklyPlan([FromQuery] DateTime? date)
        {
            var referenceDate = date ?? DateTime.UtcNow;
            if (referenceDate.Kind == DateTimeKind.Unspecified)
            {
                referenceDate = DateTime.SpecifyKind(referenceDate, DateTimeKind.Utc);
            }

            var diff = referenceDate.DayOfWeek - DayOfWeek.Monday;
            if (diff < 0) diff += 7;

            var startOfWeek = referenceDate.AddDays(-diff).Date;
            var endOfWeek = startOfWeek.AddDays(7);

            var plan = await _calendarService.GetWeeklyPlanAsync(startOfWeek, endOfWeek);

            return Ok(plan);
        }

        [HttpGet("shopping-list")]
        public async Task<ActionResult<List<ShoppingListItem>>> GetShoppingList([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

                var start = startDate ?? DateTime.UtcNow.Date; 
                if (start.Kind == DateTimeKind.Unspecified) start = DateTime.SpecifyKind(start, DateTimeKind.Utc);

                var end = endDate ?? start.AddDays(7);
                if (end.Kind == DateTimeKind.Unspecified) end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

                _logger.LogInformation($"[ShoppingList] Generowanie dla User: {userId} od {start} do {end}");

                var entries = await _context.FoodEntries
                    .AsNoTracking()
                    .Where(e => e.UserId == userId && e.Date >= start && e.Date <= end)
                    .Include(e => e.ProductEntry)
                    .ToListAsync();

                _logger.LogInformation($"[ShoppingList] Znaleziono {entries.Count} wpisów w dzienniku.");

                var recipeIds = entries
                    .Where(e => e.OriginalRecipeId.HasValue)
                    .Select(e => e.OriginalRecipeId.Value)
                    .Distinct()
                    .ToList();
                
                var recipes = await _context.Recipes
                    .AsNoTracking()
                    .Where(r => recipeIds.Contains(r.Id))
                    .Include(r => r.Components)
                    .ThenInclude(c => ((Ingredient)c).Product)
                    .ToListAsync();

                _logger.LogInformation($"[ShoppingList] Pobrano {recipes.Count} unikalnych przepisów do rozbicia.");

                var shoppingMap = new Dictionary<string, ShoppingListItem>();

                void AddToMap(string name, double amount, string unit, string category, string source)
                {
                    var key = $"{name?.ToLower()}_{unit?.ToLower()}";
                    
                    if (!shoppingMap.ContainsKey(key))
                    {
                        shoppingMap[key] = new ShoppingListItem
                        {
                            ProductId = Guid.NewGuid().ToString(),
                            Name = name ?? "Nieznany",
                            Unit = unit ?? "g",
                            TotalAmount = 0,
                            IsBought = false,
                            Category = category ?? "Inne",
                            Sources = new List<string>()
                        };
                    }

                    var item = shoppingMap[key];
                    item.TotalAmount += amount;
                    
                    string sourceInfo = $"{source}: {Math.Round(amount, 1)} {unit}";
                    if (!item.Sources.Contains(sourceInfo)) item.Sources.Add(sourceInfo);
                }

                foreach (var entry in entries)
                {
                    if (entry.OriginalRecipeId.HasValue)
                    {
                        var recipe = recipes.FirstOrDefault(r => r.Id == entry.OriginalRecipeId.Value);
                        if (recipe != null)
                        {
                            foreach (var component in recipe.Components.OfType<Ingredient>())
                            {
                                var amountNeeded = component.Amount * entry.Amount;
                                var cat = component.Product?.Category.ToString() ?? "Inne";
                                var prodName = component.Product?.Name ?? component.Name;
                                var unit = component.Product?.ServingUnit ?? "g";

                                AddToMap(prodName, amountNeeded, unit, cat, $"{recipe.Name} ({entry.Date:dd.MM})");
                            }
                        }
                        else 
                        {
                            _logger.LogWarning($"[ShoppingList] Nie znaleziono przepisu ID: {entry.OriginalRecipeId} dla wpisu z {entry.Date}");
                        }
                    }
                    else if (entry.ProductEntry != null)
                    {
                        var cat = entry.ProductEntry.Category.ToString();
                        AddToMap(entry.ProductEntry.Name, entry.Amount, entry.ProductEntry.ServingUnit ?? "g", cat, $"Przekąska ({entry.Date:dd.MM})");
                    }
                }

                var result = shoppingMap.Values
                    .OrderBy(i => i.Category)
                    .ThenBy(i => i.Name)
                    .ToList();

                _logger.LogInformation($"[ShoppingList] Zwracam {result.Count} pozycji zakupowych.");

                return Ok(result);
        }
    }
}