using DealsHub.Data;
using DealsHub.Models;
using DealsHub.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IDataRepository<Review> _reviewRepository;
        private readonly IDataRepository<User> _userRepository;
        private readonly IDataRepository<Business> _businessRepository;

        public ReviewController(IDataRepository<Review> reviewRepository, IDataRepository<User> userRepository, IDataRepository<Business> businessRepository)
        {
            _reviewRepository = reviewRepository;
            _userRepository = userRepository;
            _businessRepository = businessRepository;
        }

        [HttpGet("getAllReviews")]
        public async Task<IActionResult> GetAllCategories()
        {
            return Ok(await _reviewRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewById(int id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            return Ok(review);
        }

        [HttpPost("addNewReview")]
        public async Task<ActionResult> addReview(ReviewDto newReview)
        {
            bool exists = await _userRepository.ExistsAsync(u => u.UserId == newReview.UserId);
            if (exists == false)
                return NotFound("Wrong user id");

            bool businessExists = await _businessRepository.ExistsAsync(b => b.BusinessId == newReview.BusinessId);
            if (businessExists == false)
                return NotFound("Wrong business id");

            var review = new Review
            {
                Rating = newReview.Rating,
                UserId = newReview.UserId,
                BusinessId = newReview.BusinessId,
                Text = newReview.Text
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.Save();

            return Ok("Review added successfully");

        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateReview(int id, ReviewDto newReview)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
            {
                return NotFound("Review not found.");
            }

            review.Text = newReview.Text;
            review.UserId = newReview.UserId;
            review.BusinessId = newReview.BusinessId;
            review.Rating = newReview.Rating;

            await _reviewRepository.UpdateAsync(review);
            await _reviewRepository.Save();

            return Ok("Review updated successfully.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
            {
                return NotFound("Review not found.");
            }

            await _reviewRepository.DeleteAsync(review);
            await _reviewRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getReviewsByBusiness{id}")]
        public async Task<IActionResult> GetByBusiness(int id)
        {
            bool businessExists = await _businessRepository.ExistsAsync(b => b.BusinessId == id);
            if (businessExists == false)
                return NotFound("Wrong business id");

            var reviews = await _reviewRepository.GetAllAsyncInclude(
                r => r.BusinessId == id
                );

            if (reviews == null || !reviews.Any())
                return NotFound("No reviews found for this business.");

            return Ok(reviews);
        }

        [HttpGet("getReviewsByUser{id}")]
        public async Task<IActionResult> GetByUser(int id)
        {
            bool exists = await _userRepository.ExistsAsync(u => u.UserId == id);
            if (exists == false)
                return NotFound("Wrong user id");

            var reviews = await _reviewRepository.GetAllAsyncInclude(
                r => r.UserId == id
                );

            if (reviews == null || !reviews.Any())
                return NotFound("No reviews found for this user.");

            return Ok(reviews);
        }
    }
}
