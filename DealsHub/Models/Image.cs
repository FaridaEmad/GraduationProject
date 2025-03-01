namespace DealsHub.Models
{
    public class Image
    {
        public int Id { get; set; }
        public required string  ImageUri { get; set; }  
        public int BusinessId { get; set; }
        public Business Business { get; set; } = null!;
    }
}
