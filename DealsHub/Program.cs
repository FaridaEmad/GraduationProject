using DealsHub.Models;
using GraduationProject.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// إضافة CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // السماح للـ Frontend بالاتصال
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// إضافة DbContext مع الاتصال بقاعدة البيانات
builder.Services.AddDbContext<DealsHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// إضافة خدمات Swagger مع تعريف OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "DealsHub API", Version = "v1" });
});

// إضافة خدمات Controllers
builder.Services.AddControllers(); // إضافة خدمة الـ Controllers

var app = builder.Build();

// تهيئة Swagger في وضع التطوير
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DealsHub API v1");
    });
}

app.UseHttpsRedirection();

// تفعيل CORS
app.UseCors(MyAllowSpecificOrigins);

// تفعيل الـ Controllers
app.MapControllers(); // هذه السطر مهم لتفعيل الـ API الخاص بـ Users

app.Run();
