using Fitzo.Shared.Dtos;

namespace Fitzo.API.Services;

public class CalendarService
{
    public async Task AddMealAsync(AddMealDto dto)
    {
        await Task.CompletedTask;
    }

    public async Task<object> GetWeeklyPlanAsync(DateTime start)
    {
        return await Task.FromResult(new List<object>());
    }
}