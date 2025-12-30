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
    private readonly RecipeProtectionProxy _proxy;

    public RecipeProxyTests()
    {
        _managerMock = new Mock<IRecipeManager>();
        _userContextMock = new Mock<IUserContextService>();
        _proxy = new RecipeProtectionProxy(_managerMock.Object, _userContextMock.Object);
    }

    [Fact]
    public async Task CreateRecipe_ShouldAssignOwnerId()
    {

        var userId = Guid.NewGuid(); 
        _userContextMock.Setup(x => x.GetCurrentUserId()).Returns(userId);

        var recipe = new Recipe();

        await _proxy.CreateRecipeAsync(recipe);

        recipe.OwnerId.Should().Be(userId);
        _managerMock.Verify(x => x.CreateRecipeAsync(recipe), Times.Once);
    }

    [Fact]
    public async Task DeleteRecipe_ShouldThrow_WhenUserIsNotOwner()
    {
        var userId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var recipeId = Guid.NewGuid();

        var recipe = new Recipe { Id = recipeId, OwnerId = ownerId };

        _userContextMock.Setup(x => x.GetCurrentUserId()).Returns(userId);
        _userContextMock.Setup(x => x.GetCurrentUserRole()).Returns(UserRole.User);
        
        _managerMock.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _proxy.DeleteRecipeAsync(recipeId));
    }

    [Fact]
    public async Task DeleteRecipe_ShouldSucceed_WhenUserIsOwner()
    {
        var userId = Guid.NewGuid();
        var recipeId = Guid.NewGuid();

        var recipe = new Recipe { Id = recipeId, OwnerId = userId };

        _userContextMock.Setup(x => x.GetCurrentUserId()).Returns(userId);
        _userContextMock.Setup(x => x.GetCurrentUserRole()).Returns(UserRole.User);
        
        _managerMock.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        await _proxy.DeleteRecipeAsync(recipeId);

        _managerMock.Verify(x => x.DeleteRecipeAsync(recipeId), Times.Once);
    }
}