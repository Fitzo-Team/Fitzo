using Fitzo.Shared.Enums;

namespace Fitzo.API.Interfaces;

public interface IUserContextService
{
    int GetCurrentUserId();
    UserRole GetCurrentUserRole();
}