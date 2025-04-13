using DealsHub.Models;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Data
{
    public class DealsHubDbContext : DbContext
    {
        public DealsHubDbContext(DbContextOptions<DealsHubDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Phone> Phones { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<Image> ImageURIs { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // إضافة العلاقات بين الجداول
            // User-Phone Relationship (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Phones)
                .WithOne(p => p.User)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Business Relationship (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Businesses)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Business-Category Relationship (One-to-Many)
            modelBuilder.Entity<Category>()
                .HasMany(c => c.Businesses)
                .WithOne(b => b.Category)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Business-Offer Relationship (One-to-Many)
            modelBuilder.Entity<Business>()
                .HasMany(b => b.Offers)
                .WithOne(o => o.Business)
                .HasForeignKey(o => o.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);


            // Business-ImageURI Relationship (One-to-Many)
            modelBuilder.Entity<Business>()
                .HasMany(b => b.Images)
                .WithOne(i => i.Business)
                .HasForeignKey(i => i.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Review Relationship (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Reviews)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Business-Review Relationship (One-to-Many)
            modelBuilder.Entity<Business>()
                .HasMany(b => b.Reviews)
                .WithOne(r => r.Business)
                .HasForeignKey(r => r.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Notification Relationship (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Notifications)
                .WithOne(n => n.User)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Booking Relationship (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Bookings)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Offer-Booking Relationship (One-to-Many)
            modelBuilder.Entity<Offer>()
                .HasMany(o => o.Bookings)
                .WithOne(b => b.Offer)
                .HasForeignKey(b => b.OfferId)
                .OnDelete(DeleteBehavior.Restrict);

            // User-Payment Relationship (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Payments)
                .WithOne(p => p.User)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment-PaymentMethod Relationship (One-to-Many)
            modelBuilder.Entity<PaymentMethod>()
                .HasMany(pm => pm.Payments)
                .WithOne(p => p.PaymentMethod)
                .HasForeignKey(p => p.PaymentMethodId)
                .OnDelete(DeleteBehavior.Restrict);

            // User-Cart Relationship (One-to-One)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Carts)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // تحديد نوع الأعمدة التي تحتوي على قيم Decimal
            modelBuilder.Entity<Cart>()
                .Property(c => c.TotalAmount)
                .HasColumnType("decimal(18,2)"); // تحديد الحجم والدقة

            modelBuilder.Entity<Offer>()
                .Property(o => o.Price)
                .HasColumnType("decimal(18,2)"); // تحديد الحجم والدقة

            modelBuilder.Entity<Payment>()
                .Property(p => p.TotalPrice)
                .HasColumnType("decimal(18,2)"); // تحديد الحجم والدقة

            modelBuilder.Entity<Wishlist>()
                .HasIndex(w => new { w.UserId, w.OfferId })
                .IsUnique();

            modelBuilder.Entity<Wishlist>()
                .HasOne(w => w.User)
                .WithMany(u => u.Wishlists)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Wishlist>()
                .HasOne(w => w.Offer)
                .WithMany(o => o.Wishlists)
                .HasForeignKey(w => w.OfferId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
