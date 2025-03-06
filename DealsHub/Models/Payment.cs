using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        public required string Status { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public required User User { get; set; }
        [ForeignKey("Cart")]
        public int CartId { get; set; }
        public required Cart Cart { get; set; }
    }
}
