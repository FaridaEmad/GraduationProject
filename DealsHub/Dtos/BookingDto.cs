using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Dtos
{
    public class BookingDto
    {
        public int Quantity { get; set; }

        public int OfferId { get; set; }

        public int UserId { get; set; }

    }
}
