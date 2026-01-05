using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Fitzo.API.Services;

public class ProfileImageService : BlobStorageService
{
    public const string UploadContainerName = "avatars-temp"; 
    public const string PublicContainerName = "avatars";
    public ProfileImageService(BlobServiceClient blobServiceClient) : base(blobServiceClient)
    {
        
    }
    public virtual async Task EnsureContainerExistAsync()
    {
        await _blobServiceClient.GetBlobContainerClient(UploadContainerName).CreateIfNotExistsAsync();
        
        await _blobServiceClient.GetBlobContainerClient(PublicContainerName).CreateIfNotExistsAsync(PublicAccessType.Blob);

    }
}