using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Offer
    {
        [Key]
        public int OfferId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double DiscountPercentage { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        [ForeignKey("Business")]
        public int BusinessId { get; set; } // إجباري
        public Business Business { get; set; } // إجباري
    }
}
