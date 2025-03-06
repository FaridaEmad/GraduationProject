using Microsoft.AspNetCore.Mvc;
using DealsHub.Models;
using Microsoft.EntityFrameworkCore;
using GraduationProject.Data;
using DealsHub.Dtos;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusinessController : ControllerBase
    {
        private readonly DealsHubDbContext _context;

        public BusinessController(DealsHubDbContext context)
        {
            _context = context;
        }

        // GET: api/Business
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Business>>> GetBusinesses()
        {
            var businesses = await _context.Businesses.Include(b => b.Category).Include(b => b.User).ToListAsync();
            return Ok(businesses);
        }

        // GET: api/Business/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Business>> GetBusiness(int id)
        {
            var business = await _context.Businesses.Include(b => b.Category).Include(b => b.User).FirstOrDefaultAsync(b => b.BusinessId == id);

            if (business == null)
            {
                return NotFound();
            }

            return Ok(business);
        }

        // POST: api/Business
        [HttpPost]
        public async Task<IActionResult> CreateBusiness([FromBody] BusinessDto businessDto)
        {
            var user = await _context.Users.FindAsync(businessDto.UserId);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var category = await _context.Categories.FindAsync(businessDto.CategoryId);
            if (category == null)
            {
                return BadRequest("Category not found.");
            }

            var business = new Business
            {
                Name = businessDto.Name,
                City = businessDto.City,
                Area = businessDto.Area,
                CategoryId = businessDto.CategoryId,
                UserId = businessDto.UserId
            };

            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBusiness", new { id = business.BusinessId }, business);
        }



        // PUT: api/Business/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBusiness(int id, Business business)
        {
            if (id != business.BusinessId)
            {
                return BadRequest();
            }

            _context.Entry(business).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusinessExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Business/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(int id)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null)
            {
                return NotFound();
            }

            _context.Businesses.Remove(business);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BusinessExists(int id)
        {
            return _context.Businesses.Any(e => e.BusinessId == id);
        }
    }
}
