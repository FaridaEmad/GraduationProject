using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Phone
    {
        [Key]
        public int PhoneId { get; set; }
        public string? Number { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public required User User { get; set; }
    }

}
