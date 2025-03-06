using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }
        public string? Content { get; set; }
        public DateTime ReviewDate { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; } // إجباري
        public User User { get; set; } // إجباري
        [ForeignKey("Business")]
        public int BusinessId { get; set; } // إجباري
        public Business Business { get; set; } // إجباري
    }
}
