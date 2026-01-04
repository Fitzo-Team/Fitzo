using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;
using Fitzo.API.Entities;

namespace Fitzo.API.Services;

public class ExportImportService
{
    public byte[] ExportRecipeJSON(IEnumerable<Recipe> recipes)
    {
        var options = new JsonSerializerOptions 
        { 
            WriteIndented = true,
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping 
        };

        var jsonString = JsonSerializer.Serialize(recipes, options);
        return Encoding.UTF8.GetBytes(jsonString);
    }

    public IEnumerable<Recipe> ImportFromJSON(Stream fileStream)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReferenceHandler = ReferenceHandler.IgnoreCycles
        };

        return JsonSerializer.Deserialize<IEnumerable<Recipe>>(fileStream, options) 
                ?? new List<Recipe>();
    }
}