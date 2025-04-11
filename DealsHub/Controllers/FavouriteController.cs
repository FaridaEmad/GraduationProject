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
    public class FavouriteController : ControllerBase
    {
        private readonly IDataRepository<Favourite> _favouriteRepository;
        private readonly IDataRepository<User> _userRepository;
        private readonly IDataRepository<Business> _businessRepository;
        public FavouriteController(IDataRepository<Favourite> favouriteRepository, IDataRepository<User> userRepository, IDataRepository<Business> businessRepository)
        {
            _favouriteRepository = favouriteRepository;
            _userRepository = userRepository;
            _businessRepository = businessRepository;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getAllFavourites")]
        public async Task<IActionResult> GetAllFavourites()
        {
            return Ok(await _favouriteRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFavouriteById(int id)
        {
            var favourite = await _favouriteRepository.GetByIdAsync(id);
            if (favourite == null)
            {
                return NotFound();
            }

            return Ok(favourite);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateFavourite(int id, FavouriteDto newFavourite)
        {
            var favourite = await _favouriteRepository.GetByIdAsync(id);
            if (favourite == null)
            {
                return NotFound("Favourite not found.");
            }

            favourite.UserId = newFavourite.UserId;
            favourite.BusinessId = newFavourite.BusinessId;

            await _favouriteRepository.UpdateAsync(favourite);
            await _favouriteRepository.Save();

            return Ok("Favourite updated successfully.");
        }

        [HttpPost("addNewFavourite")]
        public async Task<ActionResult> addFavourite(FavouriteDto newFavourite)
        {
            var user = await _userRepository.GetByIdAsync(newFavourite.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var business = await _businessRepository.GetByIdAsync(newFavourite.BusinessId);
            if (business == null)
            {
                return NotFound("Business not found.");
            }

            var favourite = new Favourite
            {
                UserId = newFavourite.UserId,
                BusinessId = newFavourite.BusinessId
            };

            await _favouriteRepository.AddAsync(favourite);
            await _favouriteRepository.Save();

            return Ok("Favourite added successfully");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFavourite(int id)
        {
            var favourite = await _favouriteRepository.GetByIdAsync(id);
            if (favourite == null)
            {
                return NotFound();
            }

            await _favouriteRepository.DeleteAsync(favourite);
            await _favouriteRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getFavouriteByUser/{id}")]
        public async Task<IActionResult> GetByUser(int id)
        {
            var favourites = await _favouriteRepository.GetAllAsyncInclude(
                f => f.UserId == id
                );

            if (favourites == null || !favourites.Any())
                return NotFound("No business added to favourites yet.");

            return Ok(favourites);
        }

    }
}
