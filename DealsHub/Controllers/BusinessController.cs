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
        private readonly IDataRepository<Category> _categoryRepository;


        public BusinessController(IDataRepository<Business> businessRepository, IDataRepository<Image> imageRepository, IDataRepository<Review> reviewRepository, IDataRepository<Category> categoryRepository)
        {
            _businessRepository = businessRepository;
            _imageRepository = imageRepository;
            _reviewRepository = reviewRepository;
            _categoryRepository = categoryRepository;
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
                Logo = b.Logo,
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
                Logo = b.Logo,
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

        //[Authorize(Roles = "Admin")]
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
                Logo = newBusiness.Logo
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

        //[Authorize(Roles = "Admin")]
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
            business.Logo = newBusiness.Logo;

            await _businessRepository.UpdateAsync(business);
            await _businessRepository.Save();

            return Ok("Business updated successfully.");
        }

        //[Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(int id)
        {
            var business = await _businessRepository.GetByIdAsync(id);
            if (business == null)
            {
                return NotFound("Business not found");
            }

            await _businessRepository.DeleteAsync(business);
            await _businessRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getBusinessByCategory{id}")]
        public async Task<IActionResult> GetByCategory(int id)
        {
            bool exists = await _categoryRepository.ExistsAsync(c => c.CategoryId == id);
            if (exists == false)
                return NotFound("Wrong categoey id");

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
                Logo = b.Logo,
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
                Logo = b.Logo,
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
                Logo = b.Logo,
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
            bool exists = await _categoryRepository.ExistsAsync(c => c.CategoryId == id);
            if (exists == false)
                return NotFound("Wrong category id");

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
                Logo = b.Logo,
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
            bool exists = await _categoryRepository.ExistsAsync(c => c.CategoryId == id);
            if (exists == false)
                return NotFound("Wrong category id");

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
                Logo = b.Logo,
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

        [HttpGet("search")]
        public async Task<IActionResult> Search(String keyword)
        {
            if (String.IsNullOrWhiteSpace(keyword))
                return BadRequest("Search keyword can not be empty");

            keyword = keyword.ToLower();

            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.Name.ToLower().Contains(keyword) ||
                     b.City.ToLower().Contains(keyword) ||
                     b.Area.ToLower().Contains(keyword) ||
                     (b.Category.Name != null && b.Category.Name.ToLower().Contains(keyword)),
                b => b.Category
            );

            if (businesses == null || !businesses.Any())
                return NotFound("No matching businesses found.");

            var allReviews = await _reviewRepository.GetAllAsync();

            var result = businesses.Select(b => new BusinessWithRatingDto
            {
                Id = b.BusinessId,
                Name = b.Name,
                UserId = b.UserId,
                CategoryId = b.CategoryId,
                City = b.City,
                Area = b.Area,
                Logo = b.Logo,
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
        [HttpGet("stream-all-businesses")]
        public async IAsyncEnumerable<BusinessWithRatingDto> StreamAllBusinesses()
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(null, b => b.Images);
            var allReviews = await _reviewRepository.GetAllAsync();

            foreach (var business in businesses)
            {
                var businessReviews = allReviews.Where(r => r.BusinessId == business.BusinessId).ToList();

                var rating = businessReviews.Any()
                    ? businessReviews.Average(r => r.Rating)
                    : 0;

                var noOfReviews = businessReviews.Count;

                yield return new BusinessWithRatingDto
                {
                    Id = business.BusinessId,
                    Name = business.Name,
                    UserId = business.UserId,
                    CategoryId = business.CategoryId,
                    City = business.City,
                    Area = business.Area,
                    Logo = business.Logo,
                    ImageUrls = business.Images.Select(img => img.URL).ToList(),
                    averageRates = rating,
                    noOfReviews = noOfReviews
                };
            }
        }

        [HttpGet("fastAllBusiness")]
        public async Task<IActionResult> fastAllBusiness()
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
            criteria: null,
            includes: b => b.Images
            );

            return Ok(businesses);
        }

        [HttpGet("fastGetBusinessByCategory{id}")]
        public async Task<IActionResult> fastGetByCategory(int id)
        {
            bool exists = await _categoryRepository.ExistsAsync(c => c.CategoryId == id);
            if (exists == false)
                return NotFound("Wrong categoey id");

            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.CategoryId == id,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this category.");

            return Ok(businesses);
        }

        [HttpGet("fastGetBusinessByCity{city}")]
        public async Task<IActionResult> fastGetByCity(String city)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.City == city,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this city.");
            
            return Ok(businesses);
        }

        [HttpGet("fastGetBusinessByArea{area}")]
        public async Task<IActionResult> fastGetByArea(String area)
        {
            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.Area == area,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this area.");
            
            return Ok(businesses);
        }

        [HttpGet("fastGetBusinessByCategoryAndCity")]
        public async Task<IActionResult> fastGetByCategoryAndCity(int id, String city)
        {
            bool exists = await _categoryRepository.ExistsAsync(c => c.CategoryId == id);
            if (exists == false)
                return NotFound("Wrong category id");

            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.CategoryId == id && b.City == city,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this category and city.");
            
            return Ok(businesses);
        }

        [HttpGet("fastGetBusinessByCategoryAndArea")]
        public async Task<IActionResult> fastGetByCategoryAndArea(int id, String area)
        {
            bool exists = await _categoryRepository.ExistsAsync(c => c.CategoryId == id);
            if (exists == false)
                return NotFound("Wrong category id");

            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.CategoryId == id && b.Area == area,
                b => b.Images
                );

            if (businesses == null || !businesses.Any())
                return NotFound("No businesses found for this category and area.");

            return Ok(businesses);
        }

        [HttpGet("fastSearch")]
        public async Task<IActionResult> FastSearch(string keyword)
        {
            if (String.IsNullOrWhiteSpace(keyword))
                return BadRequest("Search keyword can not be empty");

            keyword = keyword.ToLower();

            var businesses = await _businessRepository.GetAllAsyncInclude(
                b => b.Name.ToLower().Contains(keyword) ||
                     b.City.ToLower().Contains(keyword) ||
                     b.Area.ToLower().Contains(keyword) ||
                     (b.Category.Name != null && b.Category.Name.ToLower().Contains(keyword)),
                b => b.Images
            );

            if (businesses == null || !businesses.Any())
                return NotFound("No matching businesses found.");

            var result = businesses.Select(b => new BusinessSearchDto
            {
                BusinessId = b.BusinessId,
                Name = b.Name,
                City = b.City,
                Area = b.Area,
                Logo = b.Logo,
                CategoryId = b.CategoryId,
                UserId = b.UserId,
                Images = b.Images.Select(img => new ImageForBusinessDto
                {
                    ImageURLId = img.ImageURLId,
                    URL = img.URL,
                    BusinessId = img.BusinessId,
                    Business = null
                }).ToList()
            }).ToList();

            return Ok(result);
        }

    }

}

