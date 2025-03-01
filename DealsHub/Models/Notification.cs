namespace DealsHub.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationship with User (Who received the notification)
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
