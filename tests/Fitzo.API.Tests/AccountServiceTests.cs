// using Xunit;
// using Moq;
// using Fitzo.API.Services;
// using Fitzo.API.Entities;
// using Fitzo.Shared.Enums;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Http;
// using System.Security.Claims;

// namespace Fitzo.API.Tests;

// public class ImageAvatarServiceTests
// {0
//     [Fact]
//     public async Task UpdateUserAvatarAsync_ShouldDeleteOldAvatar_WhenUserHasOne()
//     {
//         var userId = Guid.NewGuid();
//         var oldAvatarFileName = "old_avatar.jpg";
        
//         var user = new UserIdentity 
//         { 
//             Id = userId,
//             UserName = "testuser",
//             Email = "test@example.com",
//             Role = UserRole.User
//         };
        
//         var userStoreMock = new Mock<IUserStore<UserIdentity>>();
//         var userManagerMock = new Mock<UserManager<UserIdentity>>(
//             userStoreMock.Object, null, null, null, null, null, null, null, null);
        
//         userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
//             .ReturnsAsync(user);
            
//         userManagerMock.Setup(x => x.UpdateAsync(It.IsAny<UserIdentity>()))
//             .ReturnsAsync(IdentityResult.Success);

//         var profileServiceMock = new Mock<ProfileImageService>(null);
        
//         profileServiceMock.Setup(x => x.EnsureContainerExistAsync())
//             .Returns(Task.CompletedTask);

//         var service = new ImageAvatarService(profileServiceMock.Object, null);

//         var fileMock = new Mock<IFormFile>();
//         fileMock.Setup(x => x.FileName).Returns("new_photo.png");
//         fileMock.Setup(x => x.Length).Returns(100);
//         fileMock.Setup(x => x.OpenReadStream()).Returns(new MemoryStream());
//         fileMock.Setup(x => x.ContentType).Returns("image/png");

//         var result = await service.UpdateUserAvatarAsync(userId, fileMock.Object);

//         profileServiceMock.Verify(x => x.DeleteBlobAsync(
//             ProfileImageService.PublicContainerName,
//             oldAvatarFileName), 
//             Times.Once);

//         profileServiceMock.Verify(x => x.UploadBlobAsync(
//             ProfileImageService.UploadContainerName, 
//             It.Is<string>(name => name.EndsWith(".png")),
//             It.IsAny<Stream>(), 
//             It.IsAny<string>()), 
//             Times.Once);
            
//         userManagerMock.Verify(x => x.UpdateAsync(It.IsAny<UserIdentity>()), Times.Once);
//     }
// }