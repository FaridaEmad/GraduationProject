using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DealsHub.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        public string? Message { get; set; }
        public DateTime SentAt { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; } // إجباري
        public User User { get; set; } // إجباري
    }
}
