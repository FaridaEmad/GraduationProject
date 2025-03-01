namespace DealsHub.Models
{
    public class Review
    {
        public int ReviewId { get; set; }
        public int Rating { get; set; } // Rating from 1 to 5
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationship with User (Who wrote the review)
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Relationship with Business (Which business is being reviewed)
        public int BusinessId { get; set; }
        public Business Business { get; set; } = null!;
    }
}
