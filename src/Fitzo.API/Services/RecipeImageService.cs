using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Fitzo.API.Services;

public class RecipeImageService : BlobStorageService
{
    public RecipeImageService(BlobServiceClient blobServiceClient) : base(blobServiceClient)
    {
        
    }
    public async Task EnsureContainersExistAsync()
    {
        var containerUploads = _blobServiceClient.GetBlobContainerClient("uploads");
        await containerUploads.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var containerThumbs = _blobServiceClient.GetBlobContainerClient("uploads-thumbnails");
        await containerThumbs.CreateIfNotExistsAsync(PublicAccessType.Blob);
    }
}