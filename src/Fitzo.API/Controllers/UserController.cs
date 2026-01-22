using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Fitzo.Shared.Enums;
using Fitzo.API.Entities;
using Fitzo.API.Data;
using Fitzo.API.Services; 
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace Fitzo.API.Controllers; 

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly FitzoDbContext _context;
    private readonly BmrService _bmrService;
    private readonly IConfiguration _configuration;
    public UsersController(FitzoDbContext context, BmrService bmrService, IConfiguration configuration)
    {
        _context = context;
        _bmrService = bmrService;
        _configuration = configuration;
    }

    [HttpPost("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        if (!Guid.TryParse(userIdString, out var userIdGuid))
        {
            return BadRequest("Nieprawidłowy format identyfikatora użytkownika.");
        }

        var profile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userIdGuid);
        
        if (profile == null)
        {
            profile = new UserProfile { UserId = userIdGuid };
            _context.UserProfiles.Add(profile);
        }

        profile.Weight = dto.Weight;
        profile.Height = dto.Height;
        profile.Age = dto.Age;
        profile.Gender = dto.Gender;

        await _context.SaveChangesAsync();
        return Ok(profile);
    }


    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        if (!Guid.TryParse(userIdString, out var userIdGuid))
        {
            return BadRequest("Nieprawidłowy format ID w tokenie.");
        }

        var profile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userIdGuid);
        if (profile == null)
        {
            return NotFound("Profil nie został jeszcze uzupełniony.");
        }

        var avatarBaseUrl = _configuration["BlobStorageSettings:AvatarsUrl"];
        string fullImageUrl = null;
        if (!string.IsNullOrEmpty(profile.AvatarUrl))
        {
            if (profile.AvatarUrl.StartsWith("http"))
            {
                fullImageUrl = profile.AvatarUrl;
            }
            else
            {
                fullImageUrl = $"{avatarBaseUrl}/{profile.AvatarUrl}";
            }
        }

        var profileDto = await _context.UserProfiles
            .Where(x => x.UserId == userIdGuid)
            .Select(x => new UserProfileDto 
            {
                Age = x.Age,
                Weight = x.Weight,
                Height = x.Height,
                Gender = x.Gender,
                ImageUrl = fullImageUrl
            })
            .FirstOrDefaultAsync();

        if (profileDto == null)
        {
            return NotFound("Profil nie został jeszcze uzupełniony.");
        }

        return Ok(profileDto);
    }

    [Authorize]
    [HttpGet("bmr")]
    public async Task<IActionResult> GetBmr([FromQuery] BmrFormula formula = BmrFormula.MifflinStJeor)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        if (!Guid.TryParse(userIdString, out var userIdGuid))
        {
            return Unauthorized("Nieprawidłowy format ID w tokenie.");
        }

        var profile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userIdGuid);

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