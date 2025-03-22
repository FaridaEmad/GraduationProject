using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DealsHub.Models;
using GraduationProject.Data;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly DealsHubDbContext _context;

        public ReviewController(DealsHubDbContext context)
        {
            _context = context;
        }

        // 1️⃣ جلب جميع التقييمات
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            return await _context.Reviews.ToListAsync();
        }

        // 2️⃣ جلب تقييم معين عن طريق الـ ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
            {
                return NotFound("التقييم غير موجود.");
            }

            return review;
        }

        // 3️⃣ إضافة تقييم جديد
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview([FromBody] Review review)
        {
            if (review == null)
            {
                return BadRequest("بيانات التقييم غير صحيحة.");
            }

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, review);
        }

        // 4️⃣ تعديل تقييم معين
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] Review updatedReview)
        {
            if (id != updatedReview.ReviewId)
            {
                return BadRequest("الـ ID غير متطابق.");
            }

            var existingReview = await _context.Reviews.FindAsync(id);
            if (existingReview == null)
            {
                return NotFound("التقييم غير موجود.");
            }

            // تحديث البيانات
            existingReview.Text = updatedReview.Text;
            existingReview.CreatedAt = updatedReview.CreatedAt;

            _context.Entry(existingReview).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "حدث خطأ أثناء التحديث.");
            }

            return NoContent();
        }

        // 5️⃣ حذف تقييم معين
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound("التقييم غير موجود.");
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
