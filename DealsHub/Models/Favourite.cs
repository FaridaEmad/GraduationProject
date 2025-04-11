using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Models
{
    public class Favourite
    {
        [Key]
        public int FavouriteId { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        [ForeignKey("Business")]
        public int BusinessId { get; set; }

        public User User { get; set; }
        public Business Business { get; set; }
    }
}
