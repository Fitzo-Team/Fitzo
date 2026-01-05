using Fitzo.API.Entities;
using Microsoft.AspNetCore.Identity;

namespace Fitzo.API.Services;

public class ImageAvatarService
{
    private readonly ProfileImageService _profileImageService;
    private readonly UserManager<UserIdentity> _userManager;
    public ImageAvatarService(ProfileImageService profileImageService, UserManager<UserIdentity> userManager)
    {
        _profileImageService = profileImageService;
        _userManager = userManager;
    }

    public async Task<string> UpdateUserAvatarAsync(Guid userId, IFormFile file)
    {
        await _profileImageService.EnsureContainerExistAsync();

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) 
            throw new KeyNotFoundException("Użytkownik nie istnieje.");

        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {

            await _profileImageService.DeleteBlobAsync(ProfileImageService.PublicContainerName, user.AvatarUrl);
        }

        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{user.Id}_{Guid.NewGuid()}{extension}";

        using var stream = file.OpenReadStream();
        await _profileImageService.UploadBlobAsync(
            ProfileImageService.UploadContainerName,
            uniqueFileName, 
            stream, 
            file.ContentType
        );

        user.AvatarUrl = uniqueFileName;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            throw new Exception("Błąd podczas aktualizacji użytkownika w bazie.");
        }

        return uniqueFileName;
    }
}