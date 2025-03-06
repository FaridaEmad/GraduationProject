using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }
        public string? Status { get; set; }
        public DateTime BookingDate { get; set; }
        public string? Country { get; set; }
        [ForeignKey("Offer")]
        public int OfferId { get; set; } // إجباري
        public Offer Offer { get; set; } // إجباري
        [ForeignKey("User")]
        public int UserId { get; set; } // إجباري
        public User User { get; set; } // إجباري
        [ForeignKey("Cart")]
        public int CartId { get; set; } // إجباري
        public Cart Cart { get; set; } // إجباري
    }
}
