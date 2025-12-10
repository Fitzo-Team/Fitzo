using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Identity;

namespace Fitzo.API.Entities;

public class UserIdentity : IdentityUser
{
    public new Guid Id;
    public required new string Email {get; set;}
    public required UserRole Role {get; set;}
    public required string Passwordhash {get; set;}
}