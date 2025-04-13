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

        public ImageController(IDataRepository<Image> imageRepository)
        {
            _imageRepository = imageRepository;
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
                return NotFound();
            }

            await _imageRepository.DeleteAsync(image);
            await _imageRepository.Save();
            return Ok("deleted successfuly");
        }
    }
}
