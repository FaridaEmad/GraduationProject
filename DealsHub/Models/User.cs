using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace DealsHub.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? UserType { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Gender { get; set; }
        public ICollection<Phone> Phones { get; set; } = new List<Phone>(); // إجباري
        public ICollection<Review> Reviews { get; set; } = new List<Review>(); // اختياري
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>(); // اختياري
        public ICollection<Payment> Payments { get; set; } = new List<Payment>(); // اختياري
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>(); // اختياري
        public ICollection<Cart> Carts { get; set; } = new List<Cart>(); // إجباري
    }
}
