using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class PaymentMethod
    {
        [Key]
        public int PaymentMethodId { get; set; }

        [Required]
        public string Method { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
