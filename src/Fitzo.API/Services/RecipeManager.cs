using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Services
{
    public class RecipeManager : IRecipeManager
    {
        private readonly FitzoDbContext _context;

        public RecipeManager(FitzoDbContext context)
        {
            _context = context;
        }

        public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
        {
            return await _context.Recipes
                .Include(r => r.Components) 
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task CreateRecipeAsync(Recipe recipe)
        {
            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRecipeAsync(Guid id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe != null)
            {
                _context.Recipes.Remove(recipe);
                await _context.SaveChangesAsync();
            }
        }
    }
}