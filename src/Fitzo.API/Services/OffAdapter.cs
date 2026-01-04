using System.Net.Http.Json;
using System.Net.Http.Headers;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Dtos;
using System.Text;
using Ftizo.API.Services;

namespace Fitzo.API.Services;

public class OffAdapter : INutritionProvider
{
    private readonly HttpClient httpClient;

    public OffAdapter(HttpClient _httpClient)
    {
        httpClient = _httpClient;
    }

    public virtual async Task<ProductDto> GetProductAsync(string id)
    {
        var cleanId = id.StartsWith("off:") ? id.Substring(4) : id;

        var url = $"api/v0/product/{cleanId}.json?fields=code,product_name,brands,image_url,nutriments,nutrition_grades,ecoscore_grade,ingredients_from_palm_oil_n,allergens_tags,labels_tags,serving_quantity,states_tags,categories_tags";

        try
        {
            var response = await httpClient.GetFromJsonAsync<OffProductResponse>(url);
            
            if (response == null || response.Product == null)
            {
                return null;
            }

            return MapToDto(response.Product);
        }
        catch
        {
            return null;
        }
    }

    public virtual async Task<IEnumerable<ProductDto>> SearchProductsAsync(ProductSearchFilterDto filter)
    {
        var sb = new StringBuilder("cgi/search.pl?action=process&json=true");

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            sb.Append($"&search_terms={Uri.EscapeDataString(filter.Query)}");
        }

        int tagIndex = 0;

        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            sb.Append($"&tagtype_{tagIndex}=categories");
            sb.Append($"&tag_contains_{tagIndex}=contains");
            sb.Append($"&tag_{tagIndex}={Uri.EscapeDataString(filter.Category)}");
            tagIndex++;
        }

        if (!string.IsNullOrWhiteSpace(filter.Nutriscore))
        {
            sb.Append($"&tagtype_{tagIndex}=nutrition_grades");
            sb.Append($"&tag_contains_{tagIndex}=contains");
            sb.Append($"&tag_{tagIndex}={filter.Nutriscore.ToLower()}");
            tagIndex++;
        }

        if (filter.NoPalmOil) sb.Append("&ingredients_from_palm_oil=without");
        if (filter.Vegetarian) sb.Append("&labels=vegetarian");
        if (filter.Vegan) sb.Append("&labels=vegan");

        sb.Append($"&page={filter.Page}");
        sb.Append($"&page_size={filter.PageSize}");

        try
        {
            var response = await httpClient.GetFromJsonAsync<OffSearchResponse>(sb.ToString());
            if(response?.Products == null)
                return Enumerable.Empty<ProductDto>();

            return response.Products.Select(MapToDto);
        }catch (Exception ex)
        {
            Console.WriteLine($"Offsearch error: {ex.Message}");
            return Enumerable.Empty<ProductDto>();
        }
    }

    private ProductDto MapToDto(OffProduct source)
    {
        var (QualityMessages, isComplete) = AnalyzeDataQuality(source);

        return new ProductDto
        {
          ExternalId = source.Code,
          Name = source.ProductName ?? "Nieznany produkt",
          brand = source.Brands,
          ImageUrl = source.ImageUrl,
          Calories = source.Nutriments?.EnergyKcal100g ?? 0,
          Protein = source.Nutriments?.Proteins100g ?? 0,
          Carbs = source.Nutriments?.Carbohydrates100g ?? 0,
          Fat = source.Nutriments?.Fat100g ?? 0,
          NutriScore = source.NutriScoreGrade,
          EcoScore = source.EcoScoreGrade,
          HasPalmOil = source.IngredientsFromPalmOilN > 0,
          Allergens = source.AllergensTags ?? new List<string>(),
          labels = source.LabelsTags ?? new List<string>(),
          ServingSize = source.ServingQuantity,
          ServingUnit = "g",
          DataQualityMessages = QualityMessages,
          IsDataComplete = isComplete,
          Category = CategoryMapper.MapFromOffTags(source.CategoriesTags)
        };
    }

    private (List<string> messages, bool isComplete) AnalyzeDataQuality(OffProduct source)
    {
        var messages = new List<string>();
        bool isComplete = true;
        var tags = source.StatesTags ?? new List<string>();
        
        bool categoriesCompleted = tags.Contains("en:categories-completed");
        bool nutritionCompleted = tags.Contains("en:nutrition-facts-completed");
        bool categoriesToBeCompleted = tags.Contains("en:categories-to-be-completed");
        bool nutritionToBeCompleted = tags.Contains("en:nutrition-facts-to-be-completed");

        if (nutritionToBeCompleted || (categoriesCompleted && string.IsNullOrEmpty(source.NutriScoreGrade) && !nutritionCompleted))
        {
             messages.Add("Brak tabeli wartości odżywczych. Nutri-Score nie może zostać obliczony.");
             isComplete = false;
        }
        
        if (categoriesToBeCompleted)
        {
            messages.Add("Brakuje kategorii produktu. Wynik Nutri-Score może być niedokładny.");
            isComplete = false;
        }

        if (source.Nutriments != null && !source.Nutriments.Fiber100g.HasValue && !string.IsNullOrEmpty(source.NutriScoreGrade))
        {
            messages.Add("Brak danych o błonniku.");
        }

        return (messages, isComplete);
    }
}