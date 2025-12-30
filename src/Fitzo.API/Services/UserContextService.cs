using System.Security.Claims;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Services
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid GetCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            
            if (user == null) return Guid.Empty;

            var idString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(idString, out var guidId))
            {
                return guidId;
            }

            return Guid.Empty;
        }

        public UserRole GetCurrentUserRole()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return UserRole.User;
            var roleString = user.FindFirst(ClaimTypes.Role)?.Value;

            if (Enum.TryParse<UserRole>(roleString, out var role))
            {
                return role;
            }

            return UserRole.User;
        }
    }
}