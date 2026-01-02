using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fitzo.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PlanningController : ControllerBase
    {
        private readonly CalendarService _calendarService;

        public PlanningController(CalendarService calendarService)
        {
            _calendarService = calendarService;
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
    }
}