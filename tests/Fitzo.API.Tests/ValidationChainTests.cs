using Fitzo.API.Entities;
using Fitzo.API.Patterns.Validation;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Xunit;

public class ValidationChainTests
{

    [Fact]
    public void DataIntegrityValidator_ShouldThrow_WhenNameIsEmpty()
    {
        var validator = new DataIntegrityValidator();
        var recipe = new Recipe { Name = "", OwnerId = Guid.NewGuid() };

        var action = () => validator.Handle(recipe);
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Nazwa przepisu*");
    }

    [Fact]
    public void DataIntegrityValidator_ShouldThrow_WhenOwnerIdIsEmpty()
    {
        var validator = new DataIntegrityValidator();
        var recipe = new Recipe { Name = "Valid Name", OwnerId = Guid.Empty };

        var action = () => validator.Handle(recipe);
        action.Should().Throw<ArgumentException>()
            .WithMessage("*właściciela*");
    }


    [Fact]
    public void IngredientsCountValidator_ShouldThrow_WhenNoIngredients()
    {
        var validator = new IngredientsCountValidator();
        var recipe = new Recipe 
        { 
            Components = new List<RecipeComponent>() 
        };

        var action = () => validator.Handle(recipe);
        action.Should().Throw<ArgumentException>()
            .WithMessage("*przynajmniej jeden składnik*");
    }

    [Fact]
    public void IngredientsCountValidator_ShouldPass_WhenIngredientsExist()
    {
        var validator = new IngredientsCountValidator();
        var recipe = new Recipe();
        recipe.AddComponent(new Ingredient { Name = "Egg", Amount = 1 });

        var action = () => validator.Handle(recipe);
        action.Should().NotThrow();
    }


    [Fact]
    public void ImageValidator_ShouldThrow_WhenUrlIsInvalid()
    {
        var validator = new ImageValidator();
        var recipe = new Recipe { ImageUrl = "To nie jest link http" };

        var action = () => validator.Handle(recipe);
        action.Should().Throw<ArgumentException>()
            .WithMessage("*URL obrazka jest nieprawidłowy*");
    }

    [Fact]
    public void ImageValidator_ShouldPass_WhenUrlIsNull()
    {
        var validator = new ImageValidator();
        var recipe = new Recipe { ImageUrl = null };

        var action = () => validator.Handle(recipe);
        action.Should().NotThrow();
    }


    [Fact]
    public void FullChain_ShouldExecuteValidatorsInOrder()
    {
        var head = new DataIntegrityValidator();
        var second = new IngredientsCountValidator();
        var third = new ImageValidator();

        head.SetNext(second).SetNext(third);

        var recipe = new Recipe 
        { 
            Name = "Valid Name",
            OwnerId = Guid.NewGuid(),
            ImageUrl = "bad_url_format"
        };
        recipe.AddComponent(new Ingredient { Name = "Egg", Amount = 1 });

        var action = () => head.Handle(recipe);

        action.Should().Throw<ArgumentException>()
            .WithMessage("*URL obrazka jest nieprawidłowy*");
    }
}