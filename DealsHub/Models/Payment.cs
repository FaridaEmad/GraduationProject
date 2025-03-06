using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime PaymentDate { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; } // إجباري
        public User User { get; set; } // إجباري
        [ForeignKey("Cart")]
        public int CartId { get; set; } // إجباري
        public Cart Cart { get; set; } // إجباري
    }
}
