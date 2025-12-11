using Fitzo.Shared.Dtos;

namespace Fitzo.API.Interfaces;

public interface INutritionProvider
{
    Task<ProductDto> GetProductAsync(string id);
}