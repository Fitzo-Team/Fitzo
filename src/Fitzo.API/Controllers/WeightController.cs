using System.Security.Claims;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WeightController : ControllerBase
{
    private readonly FitzoDbContext _context;
    public WeightController(FitzoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddWeight([FromBody] AddWeightDto dto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var entry = new WeightEntry
        {
            UserId = userId,
            Date = dto.Date.Kind == DateTimeKind.Unspecified 
            ? DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc) : dto.Date.ToUniversalTime(),
            Value = dto.Weight
        };

        _context.WeightEntries.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(entry);
    }
    
    [HttpGet]
    public async Task<IActionResult> GetHistory()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var history = await _context.WeightEntries
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.Date)
            .ToListAsync();

        return Ok(history);
    }
}