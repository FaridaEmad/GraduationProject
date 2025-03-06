using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Image
    {
        [Key]
        public int ImageId { get; set; }
        public string? ImageURL { get; set; }
        [ForeignKey("Business")]
        public int BusinessId { get; set; }
        public required Business Business { get; set; }
    }

}
