using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Identity;

namespace Fitzo.API.Entities;

public class UserIdentity : IdentityUser<Guid>
{
    public required UserRole Role { get; set; }
    

}