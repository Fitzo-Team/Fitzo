using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Fitzo.Shared.Enums;
using Fitzo.API.Entities;
using Fitzo.API.Data;     
using Fitzo.API.Services; 

namespace Fitzo.API.Controllers; 

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{

    private readonly FitzoDbContext _context;
    
    private readonly BmrService _bmrService;

    public UsersController(FitzoDbContext context, BmrService bmrService)
    {
        _context = context;
        _bmrService = bmrService;
    }

    [HttpPost("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();


        var profile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
        
        if (profile == null)
        {
            profile = new UserProfile { UserId = userId };
            _context.UserProfiles.Add(profile);
        }

        profile.Weight = dto.Weight;
        profile.Height = dto.Height;
        profile.Age = dto.Age;
        profile.Gender = dto.Gender;

        await _context.SaveChangesAsync();
        return Ok(profile);
    }

    [HttpGet("bmr")]
    public async Task<IActionResult> GetBmr([FromQuery] BmrFormula formula = BmrFormula.MifflinStJeor)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return BadRequest("Najpierw uzupełnij profil użytkownika (waga, wzrost, wiek).");
        }

        double bmrValue = _bmrService.CalculateBmr(profile, formula);

        return Ok(new 
        { 
            Formula = formula.ToString(),
            Bmr = Math.Round(bmrValue, 0) 
        });
    }
}

public class UserProfileDto
{
    public double Weight { get; set; }
    public double Height { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
}