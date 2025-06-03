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
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IDataRepository<Business> _businessRepository;
        private readonly IDataRepository<Review> _reviewRepository;

        public MachineController(IHttpClientFactory httpClientFactory, IDataRepository<Business> businessRepository, IDataRepository<Review> reviewRepository)
        {
            _httpClientFactory = httpClientFactory;
            _businessRepository = businessRepository;
            _reviewRepository = reviewRepository;
        }

        [HttpGet("userRecommend")]
        public async Task<IActionResult> GetUserRecommendations(int userId, int numOfRecommends = 5)
        {
            string apiUrl = $"http://127.0.0.1:8000/userRecommend?userId={userId}&numOfRecommends={numOfRecommends}";
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Failed to fetch recommendations from the ML model.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var recommendedIds = JsonConvert.DeserializeObject<List<int>>(content);

            var result = recommendedIds.Select(BusinessId => new { BusinessId }).ToList();

            return Ok(result);
        }

        [HttpGet("userRecommendWithArea")]
        public async Task<IActionResult> GetUserRecommendationsWithArea(int userId, string area, int numOfRecommends = 5)
        {
            string apiUrl = $"http://127.0.0.1:8000/userRecommendWithArea?userId={userId}&area={area}&numOfRecommends={numOfRecommends}";
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Failed to fetch recommendations from the ML model.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var recommendedIds = JsonConvert.DeserializeObject<List<int>>(content);

            var result = recommendedIds.Select(BusinessId => new { BusinessId }).ToList();

            return Ok(result);
        }

        [HttpGet("businessRecommend")]
        public async Task<IActionResult> GetBusinessRecommendations(int businessID, int numOfRecommends = 5)
        {
            string apiUrl = $"http://127.0.0.1:8000/contentRecommend?businessId={businessID}&topN={numOfRecommends}";
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Failed to fetch recommendations from the ML model.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var recommendedIds = JsonConvert.DeserializeObject<List<int>>(content);

            var result = recommendedIds.Select(BusinessId => new { BusinessId }).ToList();

            return Ok(result);
        }

    }
}
