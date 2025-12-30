using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Patterns;
using Fitzo.Shared.Dtos;
using Fitzo.Shared.Enums;
using Moq;
using Xunit;

public class RecipeDirectorTests
{
    private readonly Mock<IRecipeBuilder> _builderMock;
    private readonly RecipeDirector _sut;

    public RecipeDirectorTests()
    {
        _builderMock = new Mock<IRecipeBuilder>();
        _sut = new RecipeDirector(_builderMock.Object);
    }

    [Fact]
    public void Construct_ShouldCallBuilderMethods_InCorrectOrder()
    {
        var dto = new CreateRecipeDto
        {
            Name = "Scrambled Eggs",
            ImageUrl = "eggs.jpg",
            Tags = new List<DietTag> { DietTag.Keto },
            Ingredients = new List<IngredientDto>
            {
                new IngredientDto { ProductName = "Egg", Amount = 100 }
            }
        };

        _builderMock.Setup(b => b.Build()).Returns(new Recipe());

        _sut.Construct(dto);

        _builderMock.Verify(x => x.Reset(), Times.Once);

        _builderMock.Verify(x => x.SetName("Scrambled Eggs"), Times.Once);
        _builderMock.Verify(x => x.SetImage("eggs.jpg"), Times.Once);
        _builderMock.Verify(x => x.SetDietTags(dto.Tags), Times.Once);

        _builderMock.Verify(x => x.AddIngredient(It.Is<IngredientDto>(i => i.ProductName == "Egg")), Times.Once);

        _builderMock.Verify(x => x.Build(), Times.Once);
    }

    [Fact]
    public void Construct_ShouldHandleNullOptionalFields()
    {
        var dto = new CreateRecipeDto
        {
            Name = "Just Water",
            ImageUrl = null,
            Tags = null,
            Ingredients = null
        };

        _builderMock.Setup(b => b.Build()).Returns(new Recipe());

        _sut.Construct(dto);

        _builderMock.Verify(x => x.SetName("Just Water"), Times.Once);
        
        _builderMock.Verify(x => x.SetImage(It.IsAny<string>()), Times.Never);
        _builderMock.Verify(x => x.SetDietTags(It.IsAny<List<DietTag>>()), Times.Never);
        _builderMock.Verify(x => x.AddIngredient(It.IsAny<IngredientDto>()), Times.Never);
        
        _builderMock.Verify(x => x.Build(), Times.Once);
    }
}