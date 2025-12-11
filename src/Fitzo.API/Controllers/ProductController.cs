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

    [HttpGet("search/{id}")]
    public async Task<IActionResult> GetProduct(string id)
    {
        var Product = await nutritionProvider.GetProductAsync(id);
        if(Product == null)
            throw new Exception("Nie znaleziono w bazie");

        return Ok(Product);
    }
}