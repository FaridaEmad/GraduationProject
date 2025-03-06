using DealsHub.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;


public class Business
{
    [Key]
    public int BusinessId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    [Required]
    [StringLength(100)]
    public string City { get; set; }

    [Required]
    [StringLength(100)]
    public string Area { get; set; }

    [ForeignKey("Category")]
    public int? CategoryId { get; set; } // اختياري
    [JsonIgnore]
    public virtual Category? Category { get; set; } // اختياري

    [ForeignKey("User")]
    [Required] // التأكد من أن UserId غير فارغ
    public int UserId { get; set; } // إجباري
    public virtual User User { get; set; } // إجباري

    public ICollection<Image> ImageURIs { get; set; } = new List<Image>(); // اختياري
    public ICollection<Offer> Offers { get; set; } = new List<Offer>(); // إجباري
}
