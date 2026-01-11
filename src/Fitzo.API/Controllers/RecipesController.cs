using System.Security.Claims;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Patterns;
using Fitzo.API.Services;
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
        private readonly RecipeService _recipeService;
        private readonly IConfiguration _configuration;

        public RecipesController(RecipeDirector director, IRecipeManager recipeManager, RecipeService recipeService, IConfiguration configuration)
        {
            _director = director;
            _recipeManager = recipeManager;
            _recipeService = recipeService;
            _configuration = configuration;
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

        [HttpGet]
        public async Task<ActionResult> GetRecipes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(!Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var recipes = await _recipeManager.GetRecipes(userGuid);
            var result = recipes.Select(r => MapRecipeToDto(r));
        
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(Guid id)
        {
            var recipe = await _recipeManager.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            try
            {
                await _recipeManager.DeleteRecipeAsync(id);

                if (!string.IsNullOrEmpty(recipe.ImageUrl))
                {
                    try 
                    {
                        await _recipeService.DeleteRecipeImage(recipe.ImageUrl);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[WARNING] Nie udało się usunąć obrazów dla przepisu {id}: {ex.Message}");
                    }
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImage([FromRoute] Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Brak pliku do przesłania.");
            }

            var recipe = await _recipeManager.GetRecipeByIdAsync(id);
            if (recipe == null)
            {
                return NotFound("Nie znaleziono przepisu.");
            }

            var uploadedFileName = await _recipeService.UploadRecipeImage(file);

            await _recipeManager.UpdateRecipeImageAsync(id, uploadedFileName);

            var fullUrl = GetFullBlobUrl(uploadedFileName);

            return Ok(new { ImageUrl = fullUrl });
        }

        private string GetFullBlobUrl(string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return null;

            var baseUrl = _configuration["BlobStorageSettings: ImagesUrl"];
            //"http://127.0.0.1:10000/devstoreaccount1/uploads";
            return $"{baseUrl}/{fileName}";
        }

        private string GetThumbnailBlobUrl(string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return null;

            var baseUrl = _configuration["BlobStorageSettings:ThumbnailsUrl"];
            return $"{baseUrl}/{fileName}";
        }
        private object MapRecipeToDto(Recipe recipe)
        {
            return new
            {
                recipe.Id,
                recipe.Name,
                ImageUrl = GetFullBlobUrl(recipe.ImageUrl),
                ThumbnailUrl = GetThumbnailBlobUrl(recipe.ImageUrl),
                recipe.Tags,
                
                TotalCalories = recipe.CalculateCalories(),
                TotalProtein = recipe.CalculateProtein(),
                TotalFat = recipe.CalculateFat(),
                TotalCarbs = recipe.CalculateCarbs(),

                Ingredients = recipe.Components
                    .OfType<Ingredient>()
                    .Select(i => new 
                    {
                        Amount = i.Amount,
                        Product = new 
                        {
                            Name = i.Product.Name,
                            Calories = i.Product.Calories,
                            Protein = i.Product.Protein,
                            Fat = i.Product.Fat,
                            Carbs = i.Product.Carbs,
                            ServingUnit = i.Product.ServingUnit,
                            ServingSize = i.Product.ServingSize,
                            Brand = i.Product.brand,
                            ImageUrl = i.Product.ImageUrl,
                            ExternalId = i.Product.ExternalId
                        }
                    })
            };
        }
    }
