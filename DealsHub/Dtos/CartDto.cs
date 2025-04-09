namespace DealsHub.Dtos
{
    public class CartDto
    {
        public int CartId { get; set; }
        public decimal TotalAmount { get; set; }
        public int NoOfItems { get; set; }
        public bool IsActive { get; set; }
        public int UserId { get; set; }
    }
}
