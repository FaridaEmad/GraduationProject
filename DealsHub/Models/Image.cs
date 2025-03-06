using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Image
    {
        [Key]
        public int ImageId { get; set; }
        public string? ImageUrl { get; set; }
        [ForeignKey("Business")]
        public int BusinessId { get; set; } // إجباري
        public Business Business { get; set; } // إجباري
    }

}
