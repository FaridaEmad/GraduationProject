using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<Business> Businesses { get; set; } = new List<Business>();
    }
}
