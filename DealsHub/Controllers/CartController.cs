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
    public class CartController : ControllerBase
    {
        private readonly IDataRepository<Cart> _cartRepository;
        private readonly IDataRepository<User> _userRepository;

        public CartController(IDataRepository<Cart> cartRepository, IDataRepository<User> userRepository)
        {
            _cartRepository = cartRepository;
            _userRepository = userRepository;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllCarts")]
        public async Task<IActionResult> GetAllCarts()
        {
            return Ok(await _cartRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCartById(int id)
        {
            var cart = await _cartRepository.GetByIdAsync(id);
            if (cart == null)
            {
                return NotFound();
            }

            return Ok(cart);
        }

        [HttpGet("getCartActiveByUser{userId}")]
        public async Task<IActionResult> GetActiveByUser(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound("Wrong user id");

            var cart = await _cartRepository.GetByIdAsyncInclude(
                c => c.UserId == userId && c.IsActive == true
                );

            return Ok(cart);
        }

        [HttpGet("getCartsByUser{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound("Wrong user id");

            var carts = await _cartRepository.GetAllAsyncInclude(
                c => c.UserId == userId
                );

            return Ok(carts);
        }

    }
}
