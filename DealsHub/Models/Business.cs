using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{

    public class Business
    {
        [Key]
        public int BusinessId { get; set; }
        public string? Name { get; set; }
        public string? City { get; set; }
        public string? Area { get; set; }
        [ForeignKey("Category")]
        public int? CategoryId { get; set; } // اختياري
        public Category? Category { get; set; } // اختياري
        [ForeignKey("User")]
        public int UserId { get; set; } // إجباري
        public User User { get; set; } // إجباري
        public ICollection<Image> ImageURIs { get; set; } = new List<Image>(); // اختياري
        public ICollection<Offer> Offers { get; set; } = new List<Offer>(); // إجباري
    }

}

