using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Image
    {
        [Key]
        public int ImageURLId { get; set; }

        [ForeignKey("Business")]
        public int BusinessId { get; set; }

        [Required]
        public string URL { get; set; }

        public Business Business { get; set; }
    }

}
