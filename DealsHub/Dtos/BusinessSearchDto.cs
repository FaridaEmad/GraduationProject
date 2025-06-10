using System.Drawing;

namespace DealsHub.Dtos
{
    public class BusinessSearchDto
    {
        public int BusinessId { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public string Logo { get; set; }
        public int CategoryId { get; set; }
        public int UserId { get; set; }
        public object? Category { get; set; } = null;
        public object? User { get; set; } = null;
        public List<ImageForBusinessDto> Images { get; set; } = new();
        public List<object> Offers { get; set; } = new();
        public List<object> Reviews { get; set; } = new();
    }
}
