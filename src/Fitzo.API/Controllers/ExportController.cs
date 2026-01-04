using System.Text.Json;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly ExportImportService _service;
    private readonly FitzoDbContext _context;

    public ExportController(ExportImportService service, FitzoDbContext context)
    {
        _service = service;
        _context = context;
    }

    [HttpGet("recipes/json")]
    public async Task<IActionResult> GetRecipesJson()
    {
        var recipes = await _context.Recipes
            .Include(r => r.Components) 
            .ToListAsync();
            
        var fileContent = _service.ExportRecipeJSON(recipes);

        return File(fileContent, "application/json", $"fitzo_recipes_{DateTime.Now:yyyyMMdd}.json");
    }


    [HttpPost("import/json")]
    public async Task<IActionResult> ImportRecipesJson(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Brak pliku");

        if (!file.FileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Wymagany plik .json");
        }

        try 
        {
            using (var stream = file.OpenReadStream())
            {
                var importedRecipes = _service.ImportFromJSON(stream);
                int count = 0;

                foreach (var recipe in importedRecipes)
                {
                    recipe.OwnerId = Guid.Empty; 
                    
                    var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if(Guid.TryParse(userIdString, out var uid)) 
                    {
                        recipe.Id = uid;
                    }

                    if (recipe.Components != null)
                    {
                        foreach(var comp in recipe.Components) 
                        {
                            comp.Id = Guid.Empty;
                        }
                    }
                    
                    _context.Recipes.Add(recipe);
                    count++;
                }
                
                await _context.SaveChangesAsync();
                return Ok($"Pomyślnie zaimportowano {count} przepisów.");
            }
        }
        catch (JsonException)
        {
            return BadRequest("Błąd formatu pliku JSON. Plik jest uszkodzony.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Wystąpił nieoczekiwany błąd: {ex.Message}");
        }
    }
}