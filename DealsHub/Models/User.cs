using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace DealsHub.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        public required string Name { get; set; }

        [EmailAddress]
        public required string  Email { get; set; }

        public required string Password { get; set; }

        public required string UserType { get; set; }

        public DateTime CreatedAt { get; set; }

        public required string Gender { get; set; }

        public ICollection<Phone> Phones { get; set; } = new List<Phone>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    }

}
