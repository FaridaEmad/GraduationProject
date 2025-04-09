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
    public class NotificationController : ControllerBase
    {
        private readonly IDataRepository<Notification> _notificationRepository;

        public NotificationController(IDataRepository<Notification> notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        [HttpGet("getAllNotifications")]
        public async Task<IActionResult> GetAllNotifications()
        {
            return Ok(await _notificationRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(int id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            return Ok(notification);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateNotification(int id, NotificationDto newNotification)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound("Notification not found.");
            }

            notification.UserId = newNotification.UserId;
            notification.Message = newNotification.Message;

            await _notificationRepository.UpdateAsync(notification);
            await _notificationRepository.Save();

            return Ok("Notification updated successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("addNewNotification")]
        public async Task<ActionResult> addNotification(NotificationDto newNotification)
        {
            var notification = new Notification
            {
                UserId = newNotification.UserId,
                Message = newNotification.Message
            };

            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.Save();

            return Ok("Notification added successfully");

        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            await _notificationRepository.DeleteAsync(notification);
            await _notificationRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpPut("Read{id}")]
        public async Task<IActionResult> ReadNotification(int id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            notification.IsRead = true;

            await _notificationRepository.UpdateAsync(notification);
            await _notificationRepository.Save();

            return Ok("Notification Read");

        }
    }
}
