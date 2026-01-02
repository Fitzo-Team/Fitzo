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
            
            if(user == null || user.Identity?.IsAuthenticated == false)
            {
                throw new UnauthorizedAccessException("Ta operacja wymaga zalogowania");
            }

            var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(Guid.TryParse(id, out var GuidId))
            {
                return GuidId;
            }

            throw new UnauthorizedAccessException("Błedne ID użytkownika");
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