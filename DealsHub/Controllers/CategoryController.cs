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
    public class CategoryController : ControllerBase
    {
        private readonly IDataRepository<Category> _categoryRepository;

        public CategoryController(IDataRepository<Category> categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        [HttpGet("getAllCategories")]
        public async Task<IActionResult> GetAllCategories()
        {
            return Ok(await _categoryRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("addNewCategory")]
        public async Task<ActionResult> addCategory(CategoryDto newCategory)
        {
            var category = new Category
            {
                Name = newCategory.Name
            };

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.Save();

            return Ok("Category added successfully");

        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCategory(int id, string newName)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound("Category not found.");
            }

            category.Name = newName;

            await _categoryRepository.UpdateAsync(category);
            await _categoryRepository.Save();

            return Ok("Name updated successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            await _categoryRepository.DeleteAsync(category);
            await _categoryRepository.Save();
            return Ok("deleted successfuly");
        }

    }
}
