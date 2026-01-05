using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using System.ComponentModel.DataAnnotations;

namespace Fitzo.Functions.Functions;
public class ImageResizer
{
    private readonly ILogger<ImageResizer> logger;

    public ImageResizer(ILogger<ImageResizer> log){
        logger=log;
    }

    [Function(nameof(ImageResizer))]
    [BlobOutput("uploads-thumbnails/{name}")]
    public async Task<byte[]> Run(
        [BlobTrigger("uploads/{name}")] byte[] imageStream, string name)
    {
        logger.LogInformation($"Przetwarzanie: {name}");

        try
        {
            using (Image image = Image.Load(imageStream)) 
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(300, 300),
                    Mode = ResizeMode.Max
                }));

                using (var ms = new MemoryStream())
                {
                    await image.SaveAsJpegAsync(ms);
                    return ms.ToArray();
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Błąd: {ex.Message}");
            throw;
        }
    }
}