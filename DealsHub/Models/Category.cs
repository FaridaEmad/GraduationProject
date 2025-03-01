namespace DealsHub.Models
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;

        // العلاقة مع Business
        public List<Business> Businesses { get; set; } = new();
    }
}
