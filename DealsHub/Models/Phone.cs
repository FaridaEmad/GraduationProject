using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Phone
    {
        [Key]
        public int PhoneId { get; set; }

        [Required, ForeignKey("User")]
        public int UserId { get; set; }

        [Required, Phone]
        public string Number { get; set; }

        public User User { get; set; }
    }

}
