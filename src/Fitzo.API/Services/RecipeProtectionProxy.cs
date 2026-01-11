using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Services.Proxies;

public class RecipeProtectionProxy : IRecipeManager
{
    private readonly IRecipeManager _innerManager;
    private readonly IUserContextService _userContext;

    public RecipeProtectionProxy(IRecipeManager innerManager, IUserContextService userContext)
    {
        _innerManager = innerManager;
        _userContext = userContext;
    }

    public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
    {
        return await _innerManager.GetRecipeByIdAsync(id);
    }

    public async Task<IEnumerable<Recipe>> GetRecipes(Guid id)
    {
        var role = _userContext.GetCurrentUserRole();
        var currentUserId = _userContext.GetCurrentUserId();

        if (role == UserRole.Admin)
        {
            return await _innerManager.GetRecipes(id);
        }

        if (id != currentUserId)
        {
            Console.WriteLine($"[SECURITY] User {currentUserId} próbował uzyskać dostęp do przepisów użytkownika {id}");
            throw new UnauthorizedAccessException("Nie masz uprawnień do przeglądania tych przepisów.");
        }

        return await _innerManager.GetRecipes(id);
    }

    public async Task CreateRecipeAsync(Recipe recipe)
    {
        var currentUserId = _userContext.GetCurrentUserId();
        
        recipe.OwnerId = currentUserId;

        await _innerManager.CreateRecipeAsync(recipe);
    }

    public async Task DeleteRecipeAsync(Guid id)
    {
        var role = _userContext.GetCurrentUserRole();
        var currentUserId = _userContext.GetCurrentUserId();

        if (role == UserRole.Admin)
        {
            await _innerManager.DeleteRecipeAsync(id);
            return;
        }

        var recipe = await _innerManager.GetRecipeByIdAsync(id);

        if (recipe == null)
        {
            return; 
        }

        if (recipe.OwnerId != currentUserId)
        {
            Console.WriteLine($"[SECURITY] User {currentUserId} próbował usunąć przepis {id} należący do {recipe.OwnerId}");
            
            throw new UnauthorizedAccessException("Nie masz uprawnień do usunięcia tego przepisu.");
        }
        await _innerManager.DeleteRecipeAsync(id);
    }

    public async Task UpdateRecipeImageAsync(Guid id, string fileName)
    {
        var role = _userContext.GetCurrentUserRole();
        var currentUserId = _userContext.GetCurrentUserId();

        if (role == UserRole.Admin)
        {
            await _innerManager.UpdateRecipeImageAsync(id, fileName);
            return;
        }

        var recipe = await _innerManager.GetRecipeByIdAsync(id);

        if (recipe == null)
        {
            return;
        }

        if (recipe.OwnerId != currentUserId)
        {
            Console.WriteLine($"[SECURITY] User {currentUserId} próbował zmienić zdjęcie przepisu {id} należącego do {recipe.OwnerId}");
            throw new UnauthorizedAccessException("Nie masz uprawnień do edycji tego przepisu.");
        }

        await _innerManager.UpdateRecipeImageAsync(id, fileName);
    }
}