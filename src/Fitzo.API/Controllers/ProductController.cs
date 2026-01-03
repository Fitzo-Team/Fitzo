using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Fitzo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly INutritionProvider _nutritionProvider;

    public ProductController(INutritionProvider nutritionProvider)
    {
        _nutritionProvider = nutritionProvider;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(string id)
    {
        var decodedId = Uri.UnescapeDataString(id); 

        var product = await _nutritionProvider.GetProductAsync(decodedId);
        
        if (product == null)
            return NotFound($"Nie znaleziono produktu o ID: {decodedId}");

        return Ok(product);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] ProductSearchFilterDto filter)
    {
        if (string.IsNullOrWhiteSpace(filter.Query) && string.IsNullOrWhiteSpace(filter.Category))
        {
            return BadRequest("Musisz podać nazwę produktu lub wybrać kategorię.");
        }

        var results = await _nutritionProvider.SearchProductsAsync(filter);
        
        return Ok(results);
    }
}