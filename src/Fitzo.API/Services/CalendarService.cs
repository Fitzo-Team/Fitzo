using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Services
{
    public class CalendarService
    {
        private readonly FitzoDbContext _context;
        private readonly IUserContextService _userContext;

        public CalendarService(FitzoDbContext context, IUserContextService userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task AddMealAsync(AddMealDto dto)
        {
            var userId = _userContext.GetCurrentUserId();

            var recipe = await _context.Recipes.FindAsync(dto.RecipeId);
            if (recipe == null)
            {
                throw new ArgumentException("Przepis o podanym ID nie istnieje.");
            }

            var entry = new MealPlanEntry
            {
                UserId = userId,
                RecipeId = dto.RecipeId,
                Date = dto.Date.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Type = dto.Type
            };

            _context.MealPlans.Add(entry);
            await _context.SaveChangesAsync();
        }

        public async Task<List<MealPlanEntry>> GetWeeklyPlanAsync(DateTime startDate, DateTime endDate)
        {
            var userId = _userContext.GetCurrentUserId();

            var plan = await _context.MealPlans
                .Include(m => m.Recipe)
                .Where(m => m.UserId == userId 
                         && m.Date >= startDate.Date 
                         && m.Date <= endDate.Date)
                .OrderBy(m => m.Date)
                .ThenBy(m => m.StartTime)
                .ToListAsync();

            return plan;
        }
    }
}