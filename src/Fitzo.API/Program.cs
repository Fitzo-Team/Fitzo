using System.Net.Http.Headers;
using System.Text;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Services;
using Fitzo.API.Services.Bmr;
using Fitzo.API.Services.Proxies;
using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Fitzo.API.Patterns;
using Fitzo.API.Patterns.Validation;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

var connectionsString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FitzoDbContext>(options => 
    options.UseNpgsql(connectionsString));

builder.Services.AddIdentity<UserIdentity, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;

    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<FitzoDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddHttpClient<OffAdapter>(client =>
{
    client.BaseAddress = new Uri("https://world.openfoodfacts.org/");
    client.DefaultRequestHeaders.Add("User-Agent", "FitzoApp - StudentProject - version 1.0");

    var authString = "off:off";
    var authBytes = Encoding.ASCII.GetBytes(authString);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
});

builder.Services.AddHttpClient<UsdaAdapter>(client =>
{
    client.BaseAddress = new Uri("https://api.nal.usda.gov/");
});

builder.Services.AddScoped<UsdaAdapter>();
builder.Services.AddScoped<OffAdapter>();
builder.Services.AddScoped<INutritionProvider, HybridNutritionProvider>();

builder.Services.AddScoped<AuthService>();

builder.Services.AddKeyedScoped<IBmrStrategy, MifflinStJeorStrategy>(BmrFormula.MifflinStJeor);
builder.Services.AddKeyedScoped<IBmrStrategy, HarrisBenedictStrategy>(BmrFormula.HarrisBenedict);
builder.Services.AddScoped<BmrService>();

builder.Services.AddScoped<RecipeManager>();
builder.Services.AddScoped<IRecipeManager>(provider =>
{
    var innerManager = provider.GetRequiredService<RecipeManager>();
    var userContext = provider.GetRequiredService<IUserContextService>(); 

    return new RecipeProtectionProxy(innerManager, userContext);
});

builder.Services.AddTransient<IRecipeBuilder, StandardRecipeBuilder>();
builder.Services.AddTransient<RecipeDirector>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

builder.Services.AddTransient<RecipeValidationHandler>(provider =>
{
    var head = new DataIntegrityValidator();
    var second = new IngredientsCountValidator();
    var third = new ImageValidator();
    head.SetNext(second).SetNext(third);

    return head;
});

builder.Services.AddScoped<CalendarService>();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Fitzo API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseDefaultFiles(); 
app.UseStaticFiles(); 

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();