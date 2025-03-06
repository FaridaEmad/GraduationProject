using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }
        public required string Status { get; set; }
        public DateTime BookingDate { get; set; }
        public string? Country { get; set; }
        [ForeignKey("Offer")]
        public int OfferId { get; set; }
        public required Offer Offer { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public required User User { get; set; }
        [ForeignKey("Cart")]
        public int CartId { get; set; }
        public required Cart Cart { get; set; }
    }
}
