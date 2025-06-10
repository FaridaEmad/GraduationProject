using System.ComponentModel.DataAnnotations.Schema;

namespace DealsHub.Dtos
{
    public class ImageForBusinessDto
    {
        public int ImageURLId { get; set; }
        public int BusinessId { get; set; }
        public string URL { get; set; }
        public Business Business { get; set; }
    }
}
