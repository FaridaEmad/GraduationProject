using DealsHub.Data;
using DealsHub.Models;
using GraduationProject.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http.Features;


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200") // Allow both HTTP and HTTPS for frontend
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// Add DbContext with database connection
builder.Services.AddDbContext<DealsHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Swagger services with OpenAPI definition
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "DealsHub API", Version = "v1" });
});

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IDataRepository<User>, DataRepository<User>>();
builder.Services.AddScoped<IDataRepository<Phone>, DataRepository<Phone>>();
builder.Services.AddScoped<IDataRepository<Business>, DataRepository<Business>>();
builder.Services.AddScoped<IDataRepository<Offer>, DataRepository<Offer>>();
builder.Services.AddScoped<IDataRepository<Review>, DataRepository<Review>>();
builder.Services.AddScoped<IDataRepository<Cart>, DataRepository<Cart>>();
builder.Services.AddScoped<IDataRepository<Booking>, DataRepository<Booking>>();
builder.Services.AddScoped<IDataRepository<Category>, DataRepository<Category>>();
builder.Services.AddScoped<IDataRepository<Image>, DataRepository<Image>>();
builder.Services.AddScoped<IDataRepository<Notification>, DataRepository<Notification>>();
builder.Services.AddScoped<IDataRepository<PaymentMethod>, DataRepository<PaymentMethod>>();
builder.Services.AddScoped<IDataRepository<Payment>, DataRepository<Payment>>();
builder.Services.AddScoped<IDataRepository<Wishlist>, DataRepository<Wishlist>>();
builder.Services.AddControllersWithViews().AddJsonOptions(options => options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value))
    };
});

builder.Services.AddHttpClient();

// Add Controllers
builder.Services.AddControllers();

var app = builder.Build();

// Initialize Swagger in development mode
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DealsHub API v1");
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization(); 

// Enable CORS
app.UseCors(MyAllowSpecificOrigins);

// Enable Controllers
app.MapControllers(); // This line is important for enabling the Users API

app.Run();
