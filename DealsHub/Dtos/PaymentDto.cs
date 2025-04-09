using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Dtos
{
    public class PaymentDto
    {
        public int UserId { get; set; }
        public int CartId { get; set; }
        public int PaymentMethodId { get; set; }
    }
}
