namespace DealsHub.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string Country { get; set; } = string.Empty;
        public int OfferId { get; set; }
        public Offer Offer { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // علاقة الدفع
        public Payment Payment { get; set; } = null!;
    }
}
