using Microsoft.AspNetCore.Mvc;
using Fitzo.API.Patterns;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Fitzo.API.Data;

namespace Fitzo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipesController : ControllerBase
    {
        private readonly RecipeDirector _director;
        private readonly FitzoDbContext _context;

        public RecipesController(RecipeDirector director, FitzoDbContext context)
        {
            _director = director;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRecipe([FromBody] CreateRecipeDto dto)
        {
            var newRecipe = _director.Construct(dto);

            _context.Recipes.Add(newRecipe);
            await _context.SaveChangesAsync();

            return Ok(newRecipe);
        }
    }
}