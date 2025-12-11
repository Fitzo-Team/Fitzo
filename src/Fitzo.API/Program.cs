using System.Net.Http.Headers;
using System.Text;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionsString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<FitzoDbContext>(options => options.UseNpgsql(connectionsString));

builder.Services.AddIdentity<UserIdentity, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;

    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<FitzoDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddHttpClient<INutritionProvider, OffAdapter>(client =>
{
    client.BaseAddress = new Uri("https://world.openfoodfacts.net/");
    client.DefaultRequestHeaders.Add("User-Agent", "FitzoApp - StudentProject - version 1.0");

    var authString = "off:off";
    var authBytes = Encoding.ASCII.GetBytes(authString);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();