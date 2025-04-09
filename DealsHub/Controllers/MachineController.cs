using DealsHub.Data;
using DealsHub.Models;
using DealsHub.Dtos;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MachineController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IDataRepository<Business> _businessRepository;
        private readonly IDataRepository<Review> _reviewRepository;

        public MachineController(HttpClient httpClient, IDataRepository<Business> businessRepository, IDataRepository<Review> reviewRepository)
        {
            _httpClient = httpClient;
            _businessRepository = businessRepository;
            _reviewRepository = reviewRepository;
        }

        [HttpGet("userRecommend")]
        public async Task<IActionResult> GetUserRecommendations(int userId, int numOfRecommends = 5)
        {
            string apiUrl = $"http://127.0.0.1:8000/userRecommend?userId={userId}&numOfRecommends={numOfRecommends}";
            var response = await _httpClient.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Failed to fetch recommendations from the ML model.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var recommendedIds = JsonConvert.DeserializeObject<List<int>>(content);

            // Fetch recommended business details from DB
            var recommendedBusinesses = await _businessRepository.GetAllAsyncInclude(
                b => recommendedIds.Contains(b.BusinessId),
                b => b.Images
            );

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = recommendedBusinesses.Select(b => new BusinessWithRatingDto
            {
                Id = b.BusinessId,
                Name = b.Name,
                UserId = b.UserId,
                CategoryId = b.CategoryId,
                City = b.City,
                Area = b.Area,
                ImageUrls = b.Images.Select(img => img.URL).ToList(),
                averageRates = allReviews
                    .Where(r => r.BusinessId == b.BusinessId)
                    .Any() ? allReviews.Where(r => r.BusinessId == b.BusinessId).Average(r => r.Rating) : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("userRecommendWithArea")]
        public async Task<IActionResult> GetUserRecommendationsWithArea(int userId, string area, int numOfRecommends = 5)
        {
            string apiUrl = $"http://127.0.0.1:8000/userRecommendWithArea?userId={userId}&area={area}&numOfRecommends={numOfRecommends}";
            var response = await _httpClient.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Failed to fetch recommendations from the ML model.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var recommendedIds = JsonConvert.DeserializeObject<List<int>>(content);

            // Fetch recommended business details from DB
            var recommendedBusinesses = await _businessRepository.GetAllAsyncInclude(
                b => recommendedIds.Contains(b.BusinessId),
                b => b.Images
            );

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = recommendedBusinesses.Select(b => new BusinessWithRatingDto
            {
                Id = b.BusinessId,
                Name = b.Name,
                UserId = b.UserId,
                CategoryId = b.CategoryId,
                City = b.City,
                Area = b.Area,
                ImageUrls = b.Images.Select(img => img.URL).ToList(),
                averageRates = allReviews
                    .Where(r => r.BusinessId == b.BusinessId)
                    .Any() ? allReviews.Where(r => r.BusinessId == b.BusinessId).Average(r => r.Rating) : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

    }
}
