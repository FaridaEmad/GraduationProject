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
            public int CategoryId { get; set; }
            public required Category Category { get; set; }
            [ForeignKey("User")]
            public int UserId { get; set; }
            public required User User { get; set; }
            public required ICollection<Image> ImageURIs { get; set; }
            public required ICollection<Offer> Offers { get; set; }
        }
    }

