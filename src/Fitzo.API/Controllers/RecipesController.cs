using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Patterns;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fitzo.API.Controllers;
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecipesController : ControllerBase
    {
        private readonly RecipeDirector _director;
        private readonly IRecipeManager _recipeManager;

        public RecipesController(RecipeDirector director, IRecipeManager recipeManager)
        {
            _director = director;
            _recipeManager = recipeManager;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRecipe([FromBody] CreateRecipeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recipe = _director.Construct(dto);

            await _recipeManager.CreateRecipeAsync(recipe);
            var responseDto = MapRecipeToDto(recipe);

            return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, responseDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Recipe>> GetRecipe(Guid id)
        {
            var recipe = await _recipeManager.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            return Ok(MapRecipeToDto(recipe));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(Guid id)
        {
            try
            {
                await _recipeManager.DeleteRecipeAsync(id);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        private object MapRecipeToDto(Recipe recipe)
        {
            return new
            {
                recipe.Id,
                recipe.Name,
                recipe.ImageUrl,
                recipe.Tags,
                
                TotalCalories = recipe.CalculateCalories(),
                TotalProtein = recipe.CalculateProtein(),
                TotalFat = recipe.CalculateFat(),
                TotalCarbs = recipe.CalculateCarbs(),

                Components = recipe.Components.Select(c => 
                {
                    var ingredient = c as Ingredient;
                    
                    return new 
                    {
                        c.Id,
                        c.Name,
                        Type = c is Ingredient ? "Ingredient" : "Recipe",
                        
                        Amount = ingredient?.Amount ?? 0,
                        Unit = ingredient?.Product?.ServingUnit ?? "g",

                        Calories = c.CalculateCalories(),
                        Protein = c.CalculateProtein(),
                        Fat = c.CalculateFat(),
                        Carbs = c.CalculateCarbs()
                    };
                })
            };
        }

    }
