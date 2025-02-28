using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // هنا تضيفي الـ DbSets الخاصة بالكلاسات اللي تمثل الجداول
}
