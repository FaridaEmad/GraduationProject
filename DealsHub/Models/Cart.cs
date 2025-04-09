using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Cart
{
    [Key]
    public int CartId { get; set; }
    public decimal TotalAmount { get; set; }
    public int NoOfItems { get; set; }
    public bool IsActive { get; set; }
    [ForeignKey("User")]
    public int UserId { get; set; } 
    public User User { get; set; } 
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    }
}

