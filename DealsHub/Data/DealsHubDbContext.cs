using Microsoft.EntityFrameworkCore;

namespace DealsHub.Models
{
    public class DealsHubDbContext : DbContext
    {
        public DealsHubDbContext(DbContextOptions<DealsHubDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Phone> Phones { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<Image> Images { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User - Phones (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Phones)
                .WithOne(p => p.User)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Businesses (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Businesses)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Business - Images (One-to-Many)
            modelBuilder.Entity<Business>()
                .HasMany(b => b.Images)
                .WithOne(i => i.Business)
                .HasForeignKey(i => i.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            // Business - Reviews (One-to-Many)
            modelBuilder.Entity<Business>()
                .HasMany(b => b.Reviews)
                .WithOne(r => r.Business)
                .HasForeignKey(r => r.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            // Business - Offers (One-to-Many)
            modelBuilder.Entity<Business>()
                .HasMany(b => b.Offers)
                .WithOne(o => o.Business)
                .HasForeignKey(o => o.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Reviews (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Reviews)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict); // 🔴 حل المشكلة هنا

            // User - Notifications (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Notifications)
                .WithOne(n => n.User)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Bookings (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Bookings)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict); // 🔴 حل المشكلة هنا

            // Booking - Offers (One-to-One)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Offer)
                .WithMany()
                .HasForeignKey(b => b.OfferId)
                .OnDelete(DeleteBehavior.Restrict); // 🔴 حل المشكلة هنا

            // Booking - Payments (One-to-One)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Payment)
                .WithOne(p => p.Booking)
                .HasForeignKey<Payment>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
