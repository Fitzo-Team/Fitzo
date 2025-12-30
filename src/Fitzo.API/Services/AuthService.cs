using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums; 
using Microsoft.AspNetCore.Identity;

namespace Fitzo.API.Services;

public class AuthService
{
   
    private readonly UserManager<UserIdentity> _userManager;

    public AuthService(UserManager<UserIdentity> userManager)
    {
        _userManager = userManager;
    }

public async Task<IdentityResult> RegisterAsync(RegisterDto dto)
{
    var user = new UserIdentity 
    { 
        UserName = dto.Email, 
        Email = dto.Email,
        Role = UserRole.User
    };


    return await _userManager.CreateAsync(user, dto.Password);
}

    public async Task<bool> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return false;

        return await _userManager.CheckPasswordAsync(user, dto.Password);
    }
}