using DealsHub.Data;
using DealsHub.Models;
using DealsHub.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Drawing.Printing;
using Microsoft.AspNetCore.Authorization;

namespace DealsHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IDataRepository<Booking> _bookingRepository;
        private readonly IDataRepository<Cart> _cartRepository;
        private readonly IDataRepository<Offer> _offerRepository;
        private readonly IDataRepository<Notification> _notificatoinRepository;
        private readonly IDataRepository<User> _userRepository;

        public BookingController(IDataRepository<Booking> bookingRepository,
                                    IDataRepository<Cart> cartRepository,
                                    IDataRepository<Offer> offerRepository,
                                    IDataRepository<Notification> notificatoinRepository,
                                    IDataRepository<User> userRepository)
        {
            _bookingRepository = bookingRepository;
            _cartRepository = cartRepository;
            _offerRepository = offerRepository;
            _notificatoinRepository = notificatoinRepository;
            _userRepository = userRepository;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllBookingss")]
        public async Task<IActionResult> GetAllBookings()
        {
            return Ok(await _bookingRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateBookingQuantity(int id, int quantity)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            booking.Quantity = quantity;

            await _bookingRepository.UpdateAsync(booking);
            await _bookingRepository.Save();

            await updateCart(booking.CartId);

            return Ok("Quantity updated successfully.");
        }

        private async Task updateCart(int cartId)
        { 
            var confirmedBookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.CartId == cartId,
                b => b.Offer
            );

            var totalQuantity = confirmedBookings.Sum(b => b.Quantity);
            var totalPrice = confirmedBookings.Sum(b => b.Quantity * (b.Offer?.Price ?? 0));

            var newCart = await _cartRepository.GetByIdAsync(cartId);
            newCart.NoOfItems = totalQuantity;
            newCart.TotalAmount = totalPrice;

            await _cartRepository.UpdateAsync(newCart);
            await _cartRepository.Save();
        }

        [HttpPost("addNewBooking")]
        public async Task<ActionResult> addBooking(BookingDto newBooking)
        {
            bool exists = await _userRepository.ExistsAsync(u => u.UserId == newBooking.UserId);
            if (exists == false)
                return NotFound("Wrong user id");

            bool offerExists = await _offerRepository.ExistsAsync(o => o.OfferId == newBooking.OfferId);
            if (offerExists == false)
                return NotFound("Wrong offer id");

            var cart = await _cartRepository.GetByIdAsyncInclude(
                c => c.UserId == newBooking.UserId && c.IsActive == true,
                c => c.Bookings
             );
            if (cart == null)
                return NotFound("Wrong cart id");

            var existingBookings = cart.Bookings.FirstOrDefault(b => b.OfferId == newBooking.OfferId);

            if (existingBookings == null)
            {
                var booking = new Booking
                {
                    UserId = newBooking.UserId,
                    OfferId = newBooking.OfferId,
                    Quantity = newBooking.Quantity,
                    CartId = cart.CartId
                };

                await _bookingRepository.AddAsync(booking);
            }
            else
            {
                existingBookings.Quantity += newBooking.Quantity;
                await _bookingRepository.UpdateAsync(existingBookings);
            }
            
            await _bookingRepository.Save();

            await updateCart(cart.CartId);

            return Ok("Booking added successfully");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            await _bookingRepository.DeleteAsync(booking);
            await _bookingRepository.Save();

            await updateCart(booking.CartId);

            return Ok("deleted successfuly");
        }

        [HttpGet("getByCart{cartID}")]
        public async Task<IActionResult> GetByCart(int cartID)
        {
            bool exists = await _cartRepository.ExistsAsync(c => c.CartId == cartID);
            if (exists == false)
                return NotFound("Wrong cart id");

            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.CartId == cartID,
                b => b.Offer
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }

        [HttpGet("getByUser{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            bool exists = await _userRepository.ExistsAsync(u => u.UserId == userId);
            if (exists == false)
                return NotFound("Wrong user id");

            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.UserId == userId
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }
    }
}
