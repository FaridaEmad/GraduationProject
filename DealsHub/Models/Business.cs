using DealsHub.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;


public class Business
{
    [Key]
    public int BusinessId { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public string City { get; set; }

    [Required]
    public string Area { get; set; }

    public string Logo { get; set; }

    [ForeignKey("Category")]
    public int CategoryId { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }

    public Category Category { get; set; }
    public User User { get; set; }
    public ICollection<Image> Images { get; set; } = new List<Image>();
    public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

}
