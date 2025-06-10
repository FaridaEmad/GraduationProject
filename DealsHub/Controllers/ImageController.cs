using DealsHub.Data;
using DealsHub.Models;
using DealsHub.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Authorization;

namespace DealsHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly IDataRepository<Image> _imageRepository;
        private readonly IDataRepository<Business> _businessRepository;

        public ImageController(IDataRepository<Image> imageRepository, IDataRepository<Business> businessRepository)
        {
            _imageRepository = imageRepository;
            _businessRepository = businessRepository;
        }

        [HttpGet("getAllImages")]
        public async Task<IActionResult> GetAllImages()
        {
            return Ok(await _imageRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageById(int id)
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
            {
                return NotFound();
            }

            return Ok(image);
        }

        //[Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateImage(int id, string newImage)
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
            {
                return NotFound("Image not found.");
            }

            image.URL = newImage;

            await _imageRepository.UpdateAsync(image);
            await _imageRepository.Save();

            return Ok("Image Url updated successfully.");
        }

        //[Authorize(Roles = "Admin")]
        [HttpPost("addNewImage")]
        public async Task<ActionResult> addImage(ImageDto newImage)
        {
            var business = await _businessRepository.GetByIdAsync(newImage.BusinessId);
            if (business == null)
                return NotFound("Wrong business id");

            var image = new Image
            {
                BusinessId = newImage.BusinessId,
                URL = newImage.URL
            };

            await _imageRepository.AddAsync(image);
            await _imageRepository.Save();

            return Ok("Image added successfully");

        }

        //[Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
            {
                return NotFound("Image not found");
            }

            await _imageRepository.DeleteAsync(image);
            await _imageRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("GetImagesByBusiness{id}")]
        public async Task<IActionResult> GetByBusiness(int id)
        {
            bool exists = await _businessRepository.ExistsAsync(b => b.BusinessId == id);
            if (exists == false)
                return NotFound("Wrong Business id");

            var images = await _imageRepository.GetAllAsyncInclude(
                i => i.BusinessId == id
                );

            if (images == null || !images.Any())
                return NotFound("No images found for this business.");

            return Ok(images);
        }
    }
}
