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
    public class WishlistController : ControllerBase
    {
        private readonly IDataRepository<Wishlist> _wishlistRepository;
        private readonly IDataRepository<User> _userRepository;
        private readonly IDataRepository<Offer> _offerRepository;

        public WishlistController(IDataRepository<Wishlist> wishlistRepository, IDataRepository<User> userRepository, IDataRepository<Offer> offerRepository)
        {
            _wishlistRepository = wishlistRepository;
            _userRepository = userRepository;
            _offerRepository = offerRepository;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllWishlists")]
        public async Task<IActionResult> GetAllWishlists()
        {
            return Ok(await _wishlistRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWishlistById(int id)
        {
            var wishlist = await _wishlistRepository.GetByIdAsync(id);
            if (wishlist == null)
            {
                return NotFound();
            }

            return Ok(wishlist);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateWishlist(int id, WishlistDto newWishlist)
        {
            var wishlist = await _wishlistRepository.GetByIdAsync(id);
            if (wishlist == null)
            {
                return NotFound("Wishist not found.");
            }

            wishlist.UserId = newWishlist.UserId;
            wishlist.OfferId = newWishlist.OfferId;

            await _wishlistRepository.UpdateAsync(wishlist);
            await _wishlistRepository.Save();

            return Ok("Wislist updated successfully.");
        }

        [HttpPost("addNewWishlist")]
        public async Task<ActionResult> addWishlist(WishlistDto newWishlist)
        {
            var user = await _userRepository.GetByIdAsync(newWishlist.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var offer = await _offerRepository.GetByIdAsync(newWishlist.OfferId);
            if (offer == null)
            {
                return NotFound("Offer not found.");
            }

            var wishlist = new Wishlist
            {
                UserId = newWishlist.UserId,
                OfferId = newWishlist.OfferId
            };

            await _wishlistRepository.AddAsync(wishlist);
            await _wishlistRepository.Save();

            return Ok("Wishlist added successfully");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveWishlist(int id)
        {
            var wishlist = await _wishlistRepository.GetByIdAsync(id);
            if (wishlist == null)
            {
                return NotFound();
            }

            await _wishlistRepository.DeleteAsync(wishlist);
            await _wishlistRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getWishlistByUser/{id}")]
        public async Task<IActionResult> GetByUser(int id)
        {
            var wishlists = await _wishlistRepository.GetAllAsyncInclude(
                w => w.UserId == id
                );

            if (wishlists == null || !wishlists.Any())
                return NotFound("No offers added to wishlist yet.");

            return Ok(wishlists);
        }
    }
}
