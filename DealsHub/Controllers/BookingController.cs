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

        public BookingController(IDataRepository<Booking> bookingRepository,
                                    IDataRepository<Cart> cartRepository,
                                    IDataRepository<Offer> offerRepository,
                                    IDataRepository<Notification> notificatoinRepository)
        {
            _bookingRepository = bookingRepository;
            _cartRepository = cartRepository;
            _offerRepository = offerRepository;
            _notificatoinRepository = notificatoinRepository;
        }

        [Authorize(Roles = "Admin")]
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
                b => b.CartId == cartId && b.Status == "Confirmed",
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

        [Authorize(Roles = "Admin")]
        [HttpPut("confirm/{id}")]
        public async Task<ActionResult> confirmBooking(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            if (booking.Status == "Confirmed")
            {
                return BadRequest("Booking is already confirmed.");
            }

            booking.Status = "Confirmed";
            await _bookingRepository.UpdateAsync(booking);
            await _bookingRepository.Save();

            await updateCart(booking.CartId);

            var notification = new Notification
            {
                UserId = booking.UserId,
                IsRead = false,
                Message = "Your Booking Has Been Confirmd"
            };

            await _notificatoinRepository.AddAsync(notification);
            await _notificatoinRepository.Save();

            return Ok("booking confrimed successfully");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("cancel/{id}")]
        public async Task<ActionResult> cancelBooking(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound("Booking Method not found.");
            }

            if (booking.Status == "Canceled")
            {
                return BadRequest("Booking is already canceled.");
            }

            booking.Status = "Canceled";

            await _bookingRepository.UpdateAsync(booking);
            await _bookingRepository.Save();

            await updateCart(booking.CartId);

            var notification = new Notification
            {
                UserId = booking.UserId,
                IsRead = false,
                Message = "Your Booking Has Been Canceled"
            };

            await _notificatoinRepository.AddAsync(notification);
            await _notificatoinRepository.Save();

            return Ok("Booking canceled successfully.");
        }

        [HttpPost("addNewBooking")]
        public async Task<ActionResult> addBooking(BookingDto newBooking)
        {
            var cart = await _cartRepository.GetByIdAsyncInclude(
                c => c.UserId == newBooking.UserId && c.IsActive == true
             );

            var booking = new Booking
            {
                UserId = newBooking.UserId,
                OfferId = newBooking.OfferId,
                Quantity = newBooking.Quantity,
                Status = "Pending",
                CartId = cart.CartId
            };

            await _bookingRepository.AddAsync(booking);
            await _bookingRepository.Save();

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

        [Authorize(Roles = "Admin")]
        [HttpGet("getAllPending")]
        public async Task<IActionResult> GetPending()
        {
            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.Status == "Pending"
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getAllConfirmed")]
        public async Task<IActionResult> GetConfirmed()
        {
            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.Status == "Confirmed"
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getAllCanceled")]
        public async Task<IActionResult> GetCanceled()
        {
            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.Status == "Canceled"
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }

        [HttpGet("getByCart{cartID}")]
        public async Task<IActionResult> GetByCart(int cartID)
        {
            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.CartId == cartID
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }

        [HttpGet("getByUser{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var bookings = await _bookingRepository.GetAllAsyncInclude(
                b => b.UserId == userId
                );

            if (bookings == null || !bookings.Any())
                return NotFound("No bookings found.");

            return Ok(bookings);
        }
    }
}
