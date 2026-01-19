using Fitzo.API.Controllers;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Services;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using Fitzo.API.Data;
using Microsoft.Extensions.Logging;

namespace Fitzo.Tests
{
    public class PlanningControllerTests
    {
        private readonly Mock<CalendarService> _mockCalendarService;
        private readonly Mock<IShoppingListGenerator> _mockGenerator;
        private readonly FitzoDbContext _dbContext;
        private readonly PlanningController _controller;

        public PlanningControllerTests()
        {
            var options = new DbContextOptionsBuilder<FitzoDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unikalna nazwa bazy dla każdego testu
                .EnableSensitiveDataLogging()
                .Options;

            _dbContext = new FitzoDbContext(options);

            var loggerMock = new Mock<ILogger<PlanningController>>();
            _mockGenerator = new Mock<IShoppingListGenerator>();

            _mockCalendarService = new Mock<CalendarService>(null);

            _controller = new PlanningController(null, _mockGenerator.Object, _dbContext, loggerMock.Object);
        }

        private void SetupUserContext(Guid userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        // [Fact]
        // public async Task GetShoppingList_ShouldReturnList_WhenDataExists()
        // {
        //     var userId = Guid.NewGuid();
        //     SetupUserContext(userId);

        //     var testDate = DateTime.Today; 

        //     var recipe = new Recipe
        //     {
        //         Id = Guid.NewGuid(),
        //         Name = "Owsianka",
        //         OwnerId = userId,
        //         Components = new List<RecipeComponent>() 
        //     };

        //     var ingredient = new Ingredient 
        //     {
        //         Name = "Płatki owsiane", 
        //         Product = new ProductDto
        //         {
        //             Name = "Płatki owsiane",
        //             Calories = 300,
        //             ServingUnit = "g"
        //         },
        //         Amount = 100
        //     };
        //     recipe.Components.Add(ingredient);

        //     var mealPlan = new MealPlanEntry
        //     {
        //         Id = Guid.NewGuid(),
        //         UserId = userId,
        //         Date = testDate,
        //         StartTime = new TimeSpan(8, 0, 0),
        //         EndTime = new TimeSpan(8, 30, 0),
        //         Type = Fitzo.Shared.Enums.MealType.Breakfast,
        //         RecipeId = recipe.Id,
        //         Recipe = recipe
        //     };

        //     _dbContext.Recipes.Add(recipe);
        //     _dbContext.MealPlans.Add(mealPlan);
        //     await _dbContext.SaveChangesAsync();

        //     var expectedList = new List<ShoppingListItem>
        //     {
        //         new ShoppingListItem { Name = "Płatki owsiane", TotalAmount = 100, Unit = "g" }
        //     };
            
        //     _mockGenerator.Setup(g => g.Generate(It.IsAny<List<MealPlanEntry>>()))
        //                 .Returns(expectedList);

        //     var result = await _controller.GetShoppingList(testDate.AddDays(-1), testDate.AddDays(1));

        //     var okResult = Assert.IsType<OkObjectResult>(result.Result);
        //     var returnedList = Assert.IsType<List<ShoppingListItem>>(okResult.Value);
        //     Assert.True(returnedList.Any(), "Lista jest pusta - problem z datami lub mockiem.");

        //     Assert.Single(returnedList);
        //     Assert.Equal("Płatki owsiane", returnedList[0].Name);

        //     _mockGenerator.Verify(g => g.Generate(It.IsAny<List<MealPlanEntry>>()), Times.Once);
        // }

        [Fact]
        public async Task GetShoppingList_ShouldReturnEmptyList_WhenNoPlanExists()
        {
            var userId = Guid.NewGuid();
            SetupUserContext(userId);

            var result = await _controller.GetShoppingList(null, null);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedList = Assert.IsType<List<ShoppingListItem>>(okResult.Value);
            
            Assert.Empty(returnedList);
            
            _mockGenerator.Verify(g => g.Generate(It.IsAny<List<MealPlanEntry>>()), Times.Never);
        }

        [Fact]
        public async Task GetShoppingList_ShouldReturnUnauthorized_WhenUserNotLogged()
        {
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await _controller.GetShoppingList(null, null);

            Assert.IsType<UnauthorizedResult>(result.Result);
        }
    }
}