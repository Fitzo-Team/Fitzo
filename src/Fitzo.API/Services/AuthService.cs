using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums; 
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using System.Text.Encodings;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Fitzo.API.Services;

public class AuthService
{
   
    private readonly UserManager<UserIdentity> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<UserIdentity> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
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

    public async Task<string> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            return null;
        }

        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(UserIdentity user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var expirationMinutes = _configuration.GetValue<double>("JwtSettings:ExpirationInMinutes", 60);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes), 
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}