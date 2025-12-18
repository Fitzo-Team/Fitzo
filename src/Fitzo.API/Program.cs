using System.Net.Http.Headers;
using System.Text;
using Fitzo.API.Data;
using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Services;
using Fitzo.API.Services.Bmr;
using Fitzo.Shared.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- 1. PODSTAWOWE USŁUGI API ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 2. BAZA DANYCH ---
var connectionsString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FitzoDbContext>(options => 
    options.UseNpgsql(connectionsString));

// --- 3. KONFIGURACJA IDENTITY (Z KLUCZEM GUID) ---
// Musimy użyć IdentityRole<Guid>, aby pasowało do UserIdentity : IdentityUser<Guid>
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

// --- 4. HTTP CLIENTY DLA ADAPTERÓW ---
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

// --- 5. REJESTRACJA SERWISÓW I ADAPTERÓW ---
// Rejestrujemy konkretne klasy adapterów, bo HybridNutritionProvider ich wymaga w konstruktorze
builder.Services.AddScoped<UsdaAdapter>();
builder.Services.AddScoped<OffAdapter>();
builder.Services.AddScoped<INutritionProvider, HybridNutritionProvider>();

// Serwis autoryzacji
builder.Services.AddScoped<AuthService>();

// --- 6. STRATEGIE I SERWIS BMR ---
builder.Services.AddKeyedScoped<IBmrStrategy, MifflinStJeorStrategy>(BmrFormula.MifflinStJeor);
builder.Services.AddKeyedScoped<IBmrStrategy, HarrisBenedictStrategy>(BmrFormula.HarrisBenedict);
builder.Services.AddScoped<BmrService>();

var app = builder.Build();

// --- 7. MIDDLEWARE (KOLEJNOŚĆ JEST KLUCZOWA) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serwowanie plików statycznych (jeśli potrzebne)
app.UseDefaultFiles(); 
app.UseStaticFiles(); 

// Authentication musi być PRZED Authorization
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();