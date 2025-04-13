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
    public class PhoneController : ControllerBase
    {
        private readonly IDataRepository<Phone> _phoneRepository;

        public PhoneController(IDataRepository<Phone> phoneRepository)
        {
            _phoneRepository = phoneRepository;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllPhones")]
        public async Task<IActionResult> GetAllPhones()
        {
            return Ok(await _phoneRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPhoneById(int id)
        {
            var phone = await _phoneRepository.GetByIdAsync(id);
            if (phone == null)
            {
                return NotFound();
            }

            return Ok(phone);
        }

        [HttpGet("ByUser{id}")]
        public async Task<IActionResult> GetPhoneByUser(int id)
        {
            var phone = await _phoneRepository.GetAllAsyncInclude(
                p => p.UserId == id);
            if (phone == null)
            {
                return NotFound("No phone numbers yet.");
            }

            return Ok(phone);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdatePhone(int id, string newPhone)
        {
            var phone = await _phoneRepository.GetByIdAsync(id);
            if (phone == null)
            {
                return NotFound("Phone not found.");
            }

            phone.Number = newPhone;

            await _phoneRepository.UpdateAsync(phone);
            await _phoneRepository.Save();

            return Ok("Number updated successfully.");
        }

        [HttpPost("addNewPhone")]
        public async Task<ActionResult> addPhoneNumber(PhoneDto newPhone)
        {
            var phone = new Phone
            {
                UserId = newPhone.UserId,
                Number = newPhone.Number
            };

            await _phoneRepository.AddAsync(phone);
            await _phoneRepository.Save();

            return Ok("Phone added successfully");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhone(int id)
        {
            var phone = await _phoneRepository.GetByIdAsync(id);
            if (phone == null)
            {
                return NotFound();
            }

            await _phoneRepository.DeleteAsync(phone);
            await _phoneRepository.Save();
            return Ok("deleted successfuly");
        }
    }
}
