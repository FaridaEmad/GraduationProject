using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace DealsHub.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }
        public string ProfilePhoto { get; set; }

        public byte[] PasswordHash  { get; set; }
        public byte[] PasswordSalt { get; set; }

        public bool IsAdmin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Gender { get; set; }

        public ICollection<Phone> Phones { get; set; } = new List<Phone>();
        public ICollection<Business> Businesses { get; set; } = new List<Business>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Cart> Carts { get; set; }
        public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
    }
}
