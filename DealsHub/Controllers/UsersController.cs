using DealsHub.Models;
using GraduationProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DealsHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DealsHubDbContext _context;

        public UsersController(DealsHubDbContext context)
        {
            _context = context;
        }

        // Get all users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // Get a specific user by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // Create a new user
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Update an existing user
        [HttpPut("{id}")]
        // هذه هي الطريقة الخاصة بـ PUT لتحديث بيانات المستخدم
        public async Task<IActionResult> PutUser(int id, User user)
        {
            // التأكد من أن id الذي أرسلته من الـ API يطابق الـ UserId المرسل في البيانات
            if (id != user.UserId)
            {
                return BadRequest();  // إذا لم يتطابق الـ id نرجع رد سيء (Bad Request)
            }

            // جلب المستخدم الموجود من قاعدة البيانات باستخدام الـ id
            var existingUser = await _context.Users.FindAsync(id);

            // إذا كان المستخدم غير موجود، نرجع NotFound
            if (existingUser == null)
            {
                return NotFound();
            }

            // تحديث قيم المستخدم الحالي بقيم المستخدم الجديد
            existingUser.Name = user.Name;
            existingUser.Email = user.Email;
            existingUser.Password = user.Password;
            existingUser.UserType = user.UserType;
            existingUser.Gender = user.Gender;

            // حفظ التغييرات في قاعدة البيانات
            await _context.SaveChangesAsync();

            // نرجع رد ناجح بدون محتوى (No Content)
            return NoContent();
        }


        // Delete a user
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Check if user exists
        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}
