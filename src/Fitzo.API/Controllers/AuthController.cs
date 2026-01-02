using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(dto);
        
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return Ok(new { Message = "Użytkownik zarejestrowany pomyślnie." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto);

        if(token == null)
        {
            return Unauthorized("Błedne email lub hasło");
        }


        return Ok(new { Token = token});
    }
}