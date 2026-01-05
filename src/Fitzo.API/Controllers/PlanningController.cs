using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;  

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

        public PlanningController(
            CalendarService calendarService, 
            IShoppingListGenerator shoppingListGenerator, 
            FitzoDbContext context)
        {
            _calendarService = calendarService;
            _shoppingListGenerator = shoppingListGenerator;
            _context = context;
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
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var start = startDate ?? DateTime.Today;
            var end = endDate ?? start.AddDays(7);

            var mealPlanEntries = await _context.MealPlans
                .Where(mp => mp.UserId == userId && mp.Date >= start && mp.Date <= end)
                .Include(mp => mp.Recipe)
                    .ThenInclude(r => r.Components)
                .ToListAsync();

            if (!mealPlanEntries.Any())
            {
                return Ok(new List<ShoppingListItem>());
            }

            var shoppingList = _shoppingListGenerator.Generate(mealPlanEntries);

            return Ok(shoppingList);
        }
    }
}