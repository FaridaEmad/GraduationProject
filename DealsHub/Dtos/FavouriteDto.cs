using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Dtos
{
    public class FavouriteDto
    {
        public int UserId { get; set; }
        public int BusinessId { get; set; }
    }
}
