namespace Fitzo.API.Services;

public class RecipeService
{
    private readonly RecipeImageService _imageService;

    public RecipeService(RecipeImageService imageService)
    {
        _imageService = imageService;
    }

    public async Task<string> UploadRecipeImage(IFormFile file)
    {
        await _imageService.EnsureContainersExistAsync();

        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}"; 

        using var stream = file.OpenReadStream();
        
        await _imageService.UploadBlobAsync("uploads", uniqueFileName, stream, file.ContentType);

        return uniqueFileName;
    }

    public async Task DeleteRecipeImage(string imageName)
    {
        if(imageName == null)
            return;
        
        await _imageService.DeleteBlobAsync("uploads", imageName);
        await _imageService.DeleteBlobAsync("uploads-thumbnails", imageName);
    }
}