using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly INutritionProvider nutritionProvider;

    public ProductController(INutritionProvider _nutritionProvider)
    {
        nutritionProvider = _nutritionProvider;
    }

    [HttpGet("{query}")]
    public async Task<IActionResult> GetProduct(string query)
    {
        var Product = await nutritionProvider.GetProductAsync(query);
        if(Product == null)
            return NotFound($"Nie znaleziono produktu dla zapytania: {query}");

        return Ok(Product);
    }
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        if (query.IsNullOrEmpty())
        {
            return BadRequest("Musisz podać nazwe produktu");
        }

        var results = await nutritionProvider.SearchProductsAsync(query);
        return Ok(results);
    }
}