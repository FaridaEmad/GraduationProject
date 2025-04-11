using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Models
{
    public class Wishlist
    {
        [Key]
        public int WishlistId { get; set; }
        [ForeignKey("Offer")]
        public int OfferId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public Offer Offer { get; set; }
        public User User { get; set; }
    }
}
