
using System.Security.Claims;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DiaryCotroller: ControllerBase
{
    private readonly FitzoDbContext context;
    private readonly IRecipeManager recipeManager;

    public DiaryCotroller(FitzoDbContext _fitzoDbContext, IRecipeManager _recipeManager) : base()
    {
        context = _fitzoDbContext;
        recipeManager = _recipeManager;
    }
    
    [HttpPost]
    public async Task<IActionResult> AddEntry([FromBody] AddFoodEntryDto dto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(!Guid.TryParse(userIdString, out var userid)){
            return Unauthorized();
        }

        var entry = new FoodEntry
        {
            UserId = userid,
            Date = dto.Date,
            MealType = dto.MealType,
            Amount = dto.Amount
        };

        if(dto.Product != null)
        {
            entry.ProductEntry = dto.Product;
        }else if (dto.RecipeId.HasValue)
        {
            var recipe = await recipeManager.GetRecipeByIdAsync(dto.RecipeId.Value);   

            if(recipe == null)
            {
                return NotFound($"Przpis o Id: {dto.RecipeId} nie znaleziono");
            }

            entry.ProductEntry = new ProductDto
            {
                Name = recipe.Name,
                ExternalId = $"recipe:{recipe.Id}",
                ImageUrl = recipe.ImageUrl,
                
                Calories = recipe.CalculateCalories(),
                Protein = recipe.CalculateProtein(),
                Fat = recipe.CalculateFat(),
                Carbs = recipe.CalculateCarbs(),
                
                ServingUnit = "portion",
                ServingSize = 1,
                Category = FoodCategories.Unknown,
                IsDataComplete = true
            };

            entry.OriginalRecipeId = recipe.Id;
            entry.OriginRecipeName = recipe.Name;
        }
        else
        {
            return BadRequest("Musisz podac albo produkt albo id przepisu");
        }

        context.Add(entry);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEntry), new {id = entry.Id}, entry);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEntry(Guid id)
    {
        var entry = await context.FoodEntries
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entry == null) return NotFound();

        return Ok(entry);
    }

    [HttpGet]
    public async Task<IActionResult> GetDiaryEntries([FromQuery] DateTime date)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var entries = await context.FoodEntries
            .Where(e => e.UserId == userId && e.Date.Date == date.Date)
            .OrderBy(e => e.MealType)
            .ToListAsync();

        return Ok(entries);
    }
    
}