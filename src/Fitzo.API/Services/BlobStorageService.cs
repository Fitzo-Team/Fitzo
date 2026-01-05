using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Fitzo.API.Services;

public abstract class BlobStorageService
{
    protected readonly BlobServiceClient _blobServiceClient;
    protected BlobStorageService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task UploadBlobAsync(string containerName, string blobName, Stream data, string contentType)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync();
        
        var blobClient = containerClient.GetBlobClient(blobName);

        var blobHeaders = new BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blobClient.UploadAsync(data, new BlobUploadOptions 
        { 
            HttpHeaders = blobHeaders 
        });
    }

    public async Task DownloadBlobAsync(string containerName, string blobName, Stream destination)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);
        await blobClient.DownloadToAsync(destination);
    }

    public async Task DeleteBlobAsync(string containerName, string blobName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
    }
}