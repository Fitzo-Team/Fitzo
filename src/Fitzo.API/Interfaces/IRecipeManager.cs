using Fitzo.API.Entities;

namespace Fitzo.API.Interfaces;

public interface IRecipeManager
{
    Task CreateRecipeAsync(Recipe recipe);
    Task DeleteRecipeAsync(Guid id);
}