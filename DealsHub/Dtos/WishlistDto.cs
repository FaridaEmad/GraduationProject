using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Dtos
{
    public class WishlistDto
    {
        public int OfferId { get; set; }

        public int UserId { get; set; }
    }
}
