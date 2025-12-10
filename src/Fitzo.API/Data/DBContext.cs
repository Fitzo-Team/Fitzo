using Fitzo.API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Data;
public class FitzoDbContext : IdentityDbContext<UserIdentity>
{
    public FitzoDbContext(DbContextOptions<FitzoDbContext> options) : base(options)
    {
        
    }
}