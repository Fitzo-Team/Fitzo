using Fitzo.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Data;

public class FitzoDbContext : IdentityDbContext<UserIdentity, IdentityRole<Guid>, Guid>
{
    public FitzoDbContext(DbContextOptions<FitzoDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles { get; set; }
}