namespace DealsHub.Dtos
{
    public class BusinessDto
    {
        public string Name { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public int? CategoryId { get; set; }
        public int UserId { get; set; }
        public ICollection<int> ImageIds { get; set; } // إذا كنت تستخدم ID للصور بدلًا من الكائن نفسه
    }

}
