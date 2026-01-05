using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace Fitzo.Functions.Functions;

public class ImageResizer
{
    private readonly ILogger<ImageResizer> _logger;
    private readonly BlobServiceClient _blobServiceClient;

    public ImageResizer(ILogger<ImageResizer> log, BlobServiceClient blobServiceClient)
    {
        _logger = log;
        _blobServiceClient = blobServiceClient;
    }

    [Function("ResizeRecipeImage")]
    [BlobOutput("uploads-thumbnails/{name}")]
    public async Task<byte[]> RunRecipeResize(
        [BlobTrigger("uploads/{name}")] byte[] imageBytes, string name)
    {
        _logger.LogInformation($"[RECIPE] Generowanie miniatury dla przepisu: {name}");

        return ResizeImageInternal(imageBytes, 600, 600);
    }

    [Function("ProcessAvatarImage")]
    public async Task RunAvatarProcess(
        [BlobTrigger("avatars-temp/{name}")] byte[] imageBytes, 
        string name)
    {
        _logger.LogInformation($"[AVATAR] Optymalizacja i przenoszenie awatara: {name}");

        try
        {
            byte[] resizedBytes = ResizeImageInternal(imageBytes, 500, 500);

            var destContainer = _blobServiceClient.GetBlobContainerClient("avatars");
            await destContainer.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobClient = destContainer.GetBlobClient(name);

            using (var stream = new MemoryStream(resizedBytes))
            {
                await blobClient.UploadAsync(stream, new BlobUploadOptions 
                { 
                    HttpHeaders = new BlobHttpHeaders { ContentType = "image/jpeg" } 
                });
            }

            var sourceContainer = _blobServiceClient.GetBlobContainerClient("avatars-temp");
            var sourceBlob = sourceContainer.GetBlobClient(name);
            await sourceBlob.DeleteIfExistsAsync();

            _logger.LogInformation($"[AVATAR] Sukces! Zapisano do 'avatars' i usunięto źródło z 'avatars-temp'.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[AVATAR] Błąd krytyczny dla {name}: {ex.Message}");
            throw;
        }
    }

    private byte[] ResizeImageInternal(byte[] inputBytes, int width, int height)
    {
        using (Image image = Image.Load(inputBytes))
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(width, height),
                Mode = ResizeMode.Max 
            }));

            using (var ms = new MemoryStream())
            {
                image.SaveAsJpeg(ms);
                return ms.ToArray();
            }
        }
    }
}