using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace DealsHub.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string UserType { get; set; } = "Customer"; // افتراضيًا يكون Customer

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // العلاقات
        public List<Phone> Phones { get; set; } = new();
        public List<Business> Businesses { get; set; } = new();
        public List<Review> Reviews { get; set; } = new();
        public List<Notification> Notifications { get; set; } = new();
        public List<Payment> Payments { get; set; } = new();
        public List<Booking> Bookings { get; set; } = new();
    }
}
