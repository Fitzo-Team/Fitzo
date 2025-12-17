using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Services.Proxies;
using Fitzo.Shared.Enums;
using FluentAssertions;
using Moq;
using Xunit;

public class RecipeProxyTests
{
    private readonly Mock<IRecipeManager> _managerMock;
    private readonly Mock<IUserContextService> _userContextMock;
    private readonly RecipeProtectionProxy _sut;

    public RecipeProxyTests()
    {
        _managerMock = new Mock<IRecipeManager>();
        _userContextMock = new Mock<IUserContextService>();
        
        _sut = new RecipeProtectionProxy(_managerMock.Object, _userContextMock.Object);
    }

    [Fact]
    public async Task Delete_ShouldThrowException_WhenUserIsNotOwner()
    {

        var recipeId = Guid.NewGuid();
        var ownerId = 100;
        var attackerId = 666;


        _userContextMock.Setup(x => x.GetCurrentUserId()).Returns(attackerId);
        _userContextMock.Setup(x => x.GetCurrentUserRole()).Returns(UserRole.User);

        var recipe = new Recipe { Id = recipeId, Name = "Secret Pizza", OwnerId = ownerId };
        _managerMock.Setup(x => x.GetRecipeByIdAsync(recipeId))
                    .ReturnsAsync(recipe);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _sut.DeleteRecipeAsync(recipeId)
        );

        _managerMock.Verify(x => x.DeleteRecipeAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Delete_ShouldSucceed_WhenUserIsOwner()
    {
        var recipeId = Guid.NewGuid();
        var myId = 123;

        _userContextMock.Setup(x => x.GetCurrentUserId()).Returns(myId);
        _userContextMock.Setup(x => x.GetCurrentUserRole()).Returns(UserRole.User);

        var recipe = new Recipe { Id = recipeId, Name = "My Pizza", OwnerId = myId };
        _managerMock.Setup(x => x.GetRecipeByIdAsync(recipeId))
                    .ReturnsAsync(recipe);

        await _sut.DeleteRecipeAsync(recipeId);
        
        _managerMock.Verify(x => x.DeleteRecipeAsync(recipeId), Times.Once);
    }
}