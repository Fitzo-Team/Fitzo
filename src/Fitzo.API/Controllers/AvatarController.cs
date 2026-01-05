using Fitzo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly ImageAvatarService _accountService;
    private readonly IConfiguration _configuration;

    public AccountController(ImageAvatarService accountService, IConfiguration configuration)
    {
        _accountService = accountService;
        _configuration = configuration;
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Nie przesłano pliku.");
        }

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        try 
        {
            var fileName = await _accountService.UpdateUserAvatarAsync(userId, file);

            var avatarsBaseUrl = _configuration["BlobStorageSettings:AvatarsUrl"];
            var fullUrl = $"{avatarsBaseUrl}/{fileName}";

            return Ok(new { AvatarUrl = fullUrl });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Użytkownik nie został znaleziony.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Wystąpił błąd: {ex.Message}");
        }
    }
}