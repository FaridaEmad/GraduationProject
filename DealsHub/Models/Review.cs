using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Text { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("Business")]
        public int BusinessId { get; set; }

        public User User { get; set; }
        public Business Business { get; set; }
    }
}
