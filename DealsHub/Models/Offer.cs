namespace DealsHub.Models
{
    public class Offer
    {
        public int OfferId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double DiscountPercentage { get; set; }
        public string Description { get; set; } = string.Empty;
        public double Price { get; set; }

        // العلاقة مع Business
        public int BusinessId { get; set; }
        public Business Business { get; set; } = null!;
    }
}
