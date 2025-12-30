using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Patterns;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fitzo.API.Controllers
{
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

            return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipe);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Recipe>> GetRecipe(Guid id)
        {
            var recipe = await _recipeManager.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            return Ok(recipe);
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
    }
}