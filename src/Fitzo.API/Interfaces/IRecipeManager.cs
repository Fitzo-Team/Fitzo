using Fitzo.API.Entities;

namespace Fitzo.API.Interfaces;

public interface IRecipeManager
{
    Task<Recipe?> GetRecipeByIdAsync(Guid id);

    Task CreateRecipeAsync(Recipe recipe);
    Task DeleteRecipeAsync(Guid id);
}

