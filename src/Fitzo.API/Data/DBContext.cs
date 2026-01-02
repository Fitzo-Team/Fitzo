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

    public DbSet<RecipeComponent> RecipeComponents {get; set;}
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Ingredient> ingredients {get; set;}
    public DbSet<UserProfile> UserProfiles { get; set; }

    public DbSet<MealPlanEntry> MealPlans { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<RecipeComponent>()
            .HasDiscriminator<string>("Discriminator")
            .HasValue<Recipe>("Recipe")
            .HasValue<Ingredient>("Ingredient");

            builder.Entity<Ingredient>()
            .OwnsOne(i => i.Product);

            builder.Entity<Recipe>()
                .HasMany(r => r.Components)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        }
}