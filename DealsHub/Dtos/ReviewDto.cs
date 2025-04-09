using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Dtos
{
    public class ReviewDto
    {

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Text { get; set; }

        public int UserId { get; set; }

        public int BusinessId { get; set; }
    }
}
