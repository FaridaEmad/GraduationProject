using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        [Required]
        public int Quantity { get; set; }

        [ForeignKey("Offer")]
        public int OfferId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("Cart")]
        public int CartId { get; set; }

        public Offer Offer { get; set; }
        public User User { get; set; }
        public Cart Cart { get; set; }
    }
}
