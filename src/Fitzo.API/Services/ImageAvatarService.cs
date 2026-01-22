using Fitzo.API.Data;
using Fitzo.API.Entities;
using Microsoft.EntityFrameworkCore;
namespace Fitzo.API.Services;

public class ImageAvatarService
{
    private readonly ProfileImageService _profileImageService;
    private readonly FitzoDbContext _context;

    public ImageAvatarService(ProfileImageService profileImageService, FitzoDbContext context)
    {
        _profileImageService = profileImageService;
        _context = context;
    }

    public async Task<string> UpdateUserAvatarAsync(Guid userId, IFormFile file)
    {
        await _profileImageService.EnsureContainerExistAsync();

        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId);

        if (userProfile == null)
        {
            userProfile = new UserProfile { UserId = userId };
            _context.UserProfiles.Add(userProfile);
        }

        if (!string.IsNullOrEmpty(userProfile.AvatarUrl))
        {
            await _profileImageService.DeleteBlobAsync(ProfileImageService.PublicContainerName, userProfile.AvatarUrl);
        }

        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{userId}_{Guid.NewGuid()}{extension}";

        using var stream = file.OpenReadStream();
        await _profileImageService.UploadBlobAsync(
            ProfileImageService.UploadContainerName,
            uniqueFileName, 
            stream, 
            file.ContentType
        );

        userProfile.AvatarUrl = uniqueFileName;
        
        await _context.SaveChangesAsync();

        return uniqueFileName;
    }
}