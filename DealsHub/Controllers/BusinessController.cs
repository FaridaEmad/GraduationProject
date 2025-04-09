using DealsHub.Data;
using DealsHub.Models;
using DealsHub.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Authorization;


namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusinessController : ControllerBase
    {
        private readonly IDataRepository<Business> _businessRepository;
        private readonly IDataRepository<Image> _imageRepository;
        private readonly IDataRepository<Review> _reviewRepository;


        public BusinessController(IDataRepository<Business> businessRepository, IDataRepository<Image> imageRepository, IDataRepository<Review> reviewRepository)
        {
            _businessRepository = businessRepository;
            _imageRepository = imageRepository;
            _reviewRepository = reviewRepository;
        }

        [HttpGet("getAllBusiness")]
        public async Task<IActionResult> GetAllBusiness()
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
            criteria: null,
            includes: b => b.Images
            );

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId)
                .Average(r => r.Rating)
            : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBusinessById(int id)
        {
            var business = await _businessRepository.GetAllAsyncInclude(
                b => b.BusinessId == id,
                b => b.Images
                );
            if (business == null)
            {
                return NotFound();
            }

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = business.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId)
                .Average(r => r.Rating)
            : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("addNewBusiness")]
        public async Task<ActionResult> addBusiness(BusinessDto newBusiness)
        {
            var business = new Business
            {
                Name = newBusiness.Name,
                CategoryId = newBusiness.CategoryId,
                UserId = newBusiness.UserId,
                City = newBusiness.City,
                Area = newBusiness.Area,

            };

            await _businessRepository.AddAsync(business);
            await _businessRepository.Save();

            Image image = new Image
            {
                URL = newBusiness.ImageUrls,
                BusinessId = business.BusinessId
            };

            await _imageRepository.AddAsync(image);
            await _imageRepository.Save();

            return Ok("Business added successfully");

        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateBusiness(int id, BusinessUpdateDto newBusiness)
        {
            var business = await _businessRepository.GetByIdAsync(id);
            if (business == null)
            {
                return NotFound("Business not found.");
            }

            business.Area = newBusiness.Area;
            business.City = newBusiness.City;
            business.CategoryId = newBusiness.CategoryId;
            business.UserId = newBusiness.UserId;
            business.Name = newBusiness.Name;

            await _businessRepository.UpdateAsync(business);
            await _businessRepository.Save();

            return Ok("Business updated successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(int id)
        {
            var user = await _businessRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            await _businessRepository.DeleteAsync(user);
            await _businessRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getBusinessByCategory{id}")]
        public async Task<IActionResult> GetByCategory(int id)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.CategoryId == id,
                b => b.Images
                );
            
            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this category.");

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId)
                .Average(r => r.Rating)
            : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("getBusinessByCity{city}")]
        public async Task<IActionResult> GetByCity(String city)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.City == city,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this city.");

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId)
                .Average(r => r.Rating)
            : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("getBusinessByArea{area}")]
        public async Task<IActionResult> GetByArea(String area)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.Area == area,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this area.");

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId)
                .Average(r => r.Rating)
            : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("getBusinessByCategoryAndCity")]
        public async Task<IActionResult> GetByCategoryAndCity(int id, String city)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.CategoryId == id && b.City == city,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this category and city.");

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId)
                .Average(r => r.Rating)
            : 0,
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("getBusinessByCategoryAndArea")]
        public async Task<IActionResult> GetByCategoryAndArea(int id, String area)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.CategoryId == id && b.Area == area,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this category and area.");

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
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
            .Any()
            ? allReviews
                .Where(r => r.BusinessId == b.BusinessId) 
                .Average(r => r.Rating) 
            : 0, 
                noOfReviews = allReviews.Count(r => r.BusinessId == b.BusinessId) 
            }).ToList();

            return Ok(result);
        }
    }
} 
