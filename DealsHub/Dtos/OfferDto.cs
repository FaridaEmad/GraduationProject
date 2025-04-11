using DealsHub.Dtos;

public class OfferDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double DiscountPercentage { get; set; }
    public string Description { get; set; }
    public string Image { get; set; }
    public decimal Price { get; set; }
    public int BusinessId { get; set; } 
}
