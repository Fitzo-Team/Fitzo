using Fitzo.Shared.Enums;

namespace Fitzo.API.Interfaces;

public interface IUserContextService
{
    Guid GetCurrentUserId(); 
    
    UserRole GetCurrentUserRole();
}