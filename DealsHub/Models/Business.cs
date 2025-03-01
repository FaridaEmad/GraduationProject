namespace DealsHub.Models
{
    public class Business
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // إضافة العلاقة مع الصور والمراجعات والعروض
        public List<Image> Images { get; set; } = new List<Image>();
        public List<Review> Reviews { get; set; } = new List<Review>();
        public List<Offer> Offers { get; set; } = new List<Offer>();
    }
}
