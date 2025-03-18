namespace DealsHub.Dtos
{
    public class BusinessDto
    {
        public int BusinessId { get; set; } // إضافة الـ ID الخاص بالنشاط التجاري
        public string Name { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public int CategoryId { get; set; } // إزالة الـ Nullable لأنه مطلوب
        public int UserId { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>(); // تحديث الصور لاستخدام URL بدلاً من ID
        public double AverageRating { get; set; } // إضافة متوسط التقييمات
        public int TotalReviews { get; set; } // عدد التقييمات
    }

}
