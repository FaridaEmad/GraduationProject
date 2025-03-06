using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Cart
    {
        [Key]
        public int CartId { get; set; }
        public decimal TotalAmount { get; set; }
        public int NoOfItems { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public required User User { get; set; }
    }
}
