namespace DealsHub.Dtos
{
    public class BusinessWithRatingDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public string Logo { get; set; }
        public int CategoryId { get; set; }
        public int UserId { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
        public double averageRates { get; set; }
        public int noOfReviews { get; set; }
    }
}
