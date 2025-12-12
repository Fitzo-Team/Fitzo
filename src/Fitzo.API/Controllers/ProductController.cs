using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private INutritionProvider nutritionProvider;

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
}