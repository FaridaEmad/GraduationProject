using DealsHub.Data;
using DealsHub.Models;
using GraduationProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DealsHub.Dtos;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DealsHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IDataRepository<User> _userRepository;
        private readonly IDataRepository<Phone> _phoneRepository;

        public UsersController(IDataRepository<User> userRepository,
                                IDataRepository<Phone> PhoneRepository)
        {
            _userRepository = userRepository;
            _phoneRepository = PhoneRepository;
        }

        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok(await _userRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                Name = user.Name,
                Email = user.Email,
                Gender = user.Gender,
                Phones = user.Phones.Select(p => p.Number).ToList(),
                CreatedAt = user.CreatedAt,
                IsAdmin = user.IsAdmin
            };

            return Ok(userDto);
        }


        [HttpPut("changeName/{id}")]
        public async Task<ActionResult> ChangeName(int id, string newName)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.Name = newName;

            await _userRepository.UpdateAsync(user);
            await _userRepository.Save();

            return Ok("Name updated successfully.");
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepository.GetByIdAsync(id) ;
            if (user == null)
            {
                return NotFound();
            }

            await _userRepository.DeleteAsync(user);
            await _userRepository.Save();
            return Ok("deleted successfuly");
        }

    }
}
