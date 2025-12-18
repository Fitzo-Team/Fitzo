using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Fitzo.API.Controllers;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Services;
using Fitzo.API.Services.Bmr;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Enums;
using Fitzo.Shared.Dtos;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Fitzo.Tests.Controllers;

public class UsersControllerTests
{
    private FitzoDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FitzoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new FitzoDbContext(options);
    }

    private BmrService GetRealBmrService()
    {
        var services = new ServiceCollection();
        services.AddKeyedScoped<IBmrStrategy, MifflinStJeorStrategy>(BmrFormula.MifflinStJeor);
        services.AddKeyedScoped<IBmrStrategy, HarrisBenedictStrategy>(BmrFormula.HarrisBenedict);
        var provider = services.BuildServiceProvider();

        return new BmrService(provider);
    }

    private void SetupUser(UsersController controller, Guid userId)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }


    [Fact]
    public async Task UpdateProfile_ShouldCreateNewProfile_WhenNoneExists()
    {
        var context = GetInMemoryDbContext();
        var bmrService = GetRealBmrService();
        var controller = new UsersController(context, bmrService);
        var userId = Guid.NewGuid();
        
        SetupUser(controller, userId);

        var dto = new UserProfileDto { Weight = 80, Height = 180, Age = 25, Gender = Gender.Male };

        var result = await controller.UpdateProfile(dto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var profile = okResult.Value.Should().BeOfType<UserProfile>().Subject;

        profile.Weight.Should().Be(80);
        profile.UserId.Should().Be(userId);

        context.UserProfiles.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetBmr_ShouldReturnCorrectValue_WhenProfileExists()
    {
        var context = GetInMemoryDbContext();
        var bmrService = GetRealBmrService();
        var controller = new UsersController(context, bmrService);
        var userId = Guid.NewGuid();

        context.UserProfiles.Add(new UserProfile
        {
            UserId = userId,
            Weight = 100,
            Height = 200,
            Age = 30,
            Gender = Gender.Male
        });
        await context.SaveChangesAsync();

        SetupUser(controller, userId);

        var result = await controller.GetBmr(BmrFormula.MifflinStJeor);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }


    [Fact]
    public async Task GetBmr_ShouldReturnBadRequest_WhenProfileDoesNotExist()
    {
        var context = GetInMemoryDbContext();
        var bmrService = GetRealBmrService();
        var controller = new UsersController(context, bmrService);
        var userId = Guid.NewGuid();

        SetupUser(controller, userId);

        var result = await controller.GetBmr(BmrFormula.MifflinStJeor);


        result.Should().BeOfType<BadRequestObjectResult>()
            .Which.Value.Should().Be("Najpierw uzupełnij profil użytkownika (waga, wzrost, wiek).");
    }

    [Fact]
    public async Task UpdateProfile_ShouldReturnUnauthorized_WhenUserNotLoggedIn()
    {
        var context = GetInMemoryDbContext();
        var bmrService = GetRealBmrService();
        var controller = new UsersController(context, bmrService);
        
        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() 
            { 
                User = new ClaimsPrincipal(new ClaimsIdentity()) 
            }
        };

        var dto = new UserProfileDto { Weight = 70, Height = 170, Age = 20, Gender = Gender.Female };

        var result = await controller.UpdateProfile(dto);

        result.Should().BeOfType<UnauthorizedResult>();
    }
}