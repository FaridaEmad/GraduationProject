using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// إضافة خدمات الـ Controllers
builder.Services.AddControllers();

// تمكين Swagger لتوثيق الـ API (للتجربة عبر المتصفح)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// تفعيل Swagger فقط أثناء وضع التطوير (Development)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// تفعيل HTTPS
//app.UseHttpsRedirection();

// ضبط الـ Routing بحيث يتم التعرف على الـ Controllers
app.UseAuthorization();
app.MapControllers();

app.Run();
