namespace DealsHub.Models
{
    public class Phone
    {
        public int Id { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;

        // العلاقة مع المستخدم
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
