using DealsHub.Dtos;

public class OfferDto
{
    public int OfferId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double DiscountPercentage { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int BusinessId { get; set; } // BusinessId لتحديد الـ Business
    public BusinessDto Business { get; set; } // BusinessDto لاحتواء تفاصيل النشاط التجاري
}
