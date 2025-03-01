namespace DealsHub.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public string Status { get; set; } = "Pending";
        public string PaymentMethod { get; set; } = "Cash";
        public double TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // العلاقة مع User
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // العلاقة مع Booking
        public int BookingId { get; set; }
        public Booking Booking { get; set; } = null!;
    }
}
