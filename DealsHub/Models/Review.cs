using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Rating { get; set; }
        public string? Text { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public required User User { get; set; }
        [ForeignKey("Business")]
        public int BusinessId { get; set; }
        public required Business Business { get; set; }
    }
}
