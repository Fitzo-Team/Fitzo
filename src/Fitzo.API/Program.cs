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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using System.Text.Encodings.Web;
using Microsoft.Extensions.Azure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;

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

var jwtsettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtsettings.GetValue<string>("SecretKey");

if (secretKey.IsNullOrEmpty())
{
    throw new InvalidOperationException("Brak SecretKey");
}

builder.Services.AddAuthentication(jwtOptions =>
{
    jwtOptions.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    jwtOptions.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(jwtOptions =>
{
	jwtOptions.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtsettings.GetValue<string>("Issuer"),
        ValidAudience = jwtsettings.GetValue<string>("Audience"),
	    
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
	};

});

builder.Services.AddMemoryCache();
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

builder.Services.AddAzureClients(clientBuilder =>
{
    clientBuilder.AddBlobServiceClient(builder.Configuration.GetConnectionString("AzureWebJobsStorage"));
});
builder.Services.AddScoped<RecipeImageService>();
builder.Services.AddScoped<ProfileImageService>();
builder.Services.AddScoped<RecipeService>();
builder.Services.AddScoped<ImageAvatarService>();


builder.Services.AddScoped<HybridNutritionProvider>();
builder.Services.AddScoped<INutritionProvider>(provider =>
{
    var hybridProvider = provider.GetRequiredService<HybridNutritionProvider>();
    var memoryCache = provider.GetRequiredService<IMemoryCache>();
    var logger = provider.GetRequiredService<ILogger<CachingNutritionProxy>>();

    return new CachingNutritionProxy(hybridProvider, memoryCache, logger);
});


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
builder.Services.AddScoped<ExportImportService>();

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