using System.Security.Claims;
using Fitzo.API.Controllers;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fitzo.Tests.Controllers;

public static class TestHelper// TODO: stworzyc nowy plik z klasa pomocnicza
// i korzystac z niej przy innych testach kontrolerow zamiast tworzyc od nowa
{
    public static FitzoDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<FitzoDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        
        return new FitzoDbContext(options);
    }

    public static void SimulateUser(ControllerBase controller, Guid userId)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }
}
    public class WeightControllerTests
    {  
    [Fact]
    public async Task AddWeight_ShouldAddHistoryAndUpdateProfile()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = TestHelper.GetInMemoryDbContext(dbName);
        
        var userId = Guid.NewGuid();
        
        context.UserProfiles.Add(new UserProfile { UserId = userId, Weight = 80 });
        await context.SaveChangesAsync();

        context.ChangeTracker.Clear();

        var controller = new WeightController(context);
        TestHelper.SimulateUser(controller, userId);

        var dto = new AddWeightDto { Weight = 75.5, Date = DateTime.UtcNow };

        var result = await controller.AddWeight(dto);

        Assert.IsType<OkObjectResult>(result);

        context.ChangeTracker.Clear(); 

        var historyEntry = context.WeightEntries.FirstOrDefault();
        Assert.NotNull(historyEntry);
        Assert.Equal(75.5, historyEntry.Value);
        Assert.Equal(userId, historyEntry.UserId);

        var userProfile = context.UserProfiles.First();
        Assert.Equal(80, userProfile.Weight); 
    }
    }