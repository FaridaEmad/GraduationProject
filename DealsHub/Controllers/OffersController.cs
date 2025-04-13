using DealsHub.Data;
using DealsHub.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OffersController : ControllerBase
    {

        private readonly IDataRepository<Offer> _offerRepository;
        private readonly IDataRepository<Notification> _notificationRepository;
        private readonly IDataRepository<Review> _reviewRepository;


        public OffersController(IDataRepository<Offer> offerRepository,
            IDataRepository<Notification> notificationRepository,
            IDataRepository<Review> reviewRepository)
        {
            _offerRepository = offerRepository;
            _notificationRepository = notificationRepository;
            _reviewRepository = reviewRepository;
        }

        [HttpGet("getAllOffers")]
        public async Task<IActionResult> GetAllCategories()
        {
            return Ok(await _offerRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOfferById(int id)
        {
            var offer = await _offerRepository.GetByIdAsync(id);
            if (offer == null)
            {
                return NotFound();
            }

            return Ok(offer);
        }

        //[Authorize(Roles = "Admin")]
        [HttpPost("addNewOffer")]
        public async Task<ActionResult> addOffer(OfferDto newOffer)
        {
            var offer = new Offer
            {
                StartDate = newOffer.StartDate,
                EndDate = newOffer.EndDate,
                Description = newOffer.Description,
                DiscountPercentage = newOffer.DiscountPercentage,
                Price = newOffer.Price,
                BusinessId = newOffer.BusinessId,
                Image = newOffer.Image
            };

            await _offerRepository.AddAsync(offer);
            await _offerRepository.Save();

            var reviews = await _reviewRepository.GetAllAsyncInclude(
               r => r.Rating == 5 && r.BusinessId == offer.BusinessId
               );

            var notifiedUserIds = new HashSet<int>();

            foreach (var review in reviews)
            {
                if (review.UserId != 0 && !notifiedUserIds.Contains(review.UserId))
                {
                    var notification = new Notification
                    {
                        Message = $"New Offer: {offer.Description}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        UserId = review.UserId
                    };

                    await _notificationRepository.AddAsync(notification);
                    notifiedUserIds.Add(review.UserId);
                }
            }

            await _notificationRepository.Save();

            return Ok("Offer added successfully");

        }

        //[Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateOffer(int id, OfferDto newOffer)
        {
            var offer = await _offerRepository.GetByIdAsync(id);
            if (offer == null)
            {
                return NotFound("Offer not found.");
            }

            offer.StartDate = newOffer.StartDate;
            offer.EndDate = newOffer.EndDate;
            offer.Description = newOffer.Description;
            offer.DiscountPercentage = newOffer.DiscountPercentage;
            offer.Price = newOffer.Price;
            offer.BusinessId = newOffer.BusinessId;
            offer.Image = newOffer.Image;

            await _offerRepository.UpdateAsync(offer);
            await _offerRepository.Save();

            return Ok("Offer updated successfully.");
        }

        //[Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            var offer = await _offerRepository.GetByIdAsync(id);
            if (offer == null)
            {
                return NotFound();
            }

            await _offerRepository.DeleteAsync(offer);
            await _offerRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getOfferByBusiness/{id}")]
        public async Task<IActionResult> GetByBusiness(int id)
        {
            var offers = await _offerRepository.GetAllAsyncInclude(
                o => o.BusinessId == id
                );

            if (offers == null || !offers.Any())
                return NotFound("No offers found for this business.");

            return Ok(offers);
        }

        [HttpGet("getOfferByBusinessActive/{id}")]
        public async Task<IActionResult> GetByBusinessAndActive(int id)
        {
            var offers = await _offerRepository.GetAllAsyncInclude(
                o => o.BusinessId == id && o.StartDate <= DateTime.UtcNow && o.EndDate > DateTime.UtcNow
                );

            if (offers == null || !offers.Any())
                return NotFound("No active offers found for this business.");

            return Ok(offers);
        }

        [HttpGet("getOfferByBusinessInactive/{id}")]
        public async Task<IActionResult> GetByBusinessAndInactive(int id)
        {
            var offers = await _offerRepository.GetAllAsyncInclude(
                o => o.BusinessId == id && (o.EndDate < DateTime.UtcNow || o.StartDate > DateTime.UtcNow)
                );

            if (offers == null || !offers.Any())
                return NotFound("No inactive offers found for this business.");

            return Ok(offers);
        }

        [HttpGet("getOffersInactive")]
        public async Task<IActionResult> GetByAllInactive()
        {
            var offers = await _offerRepository.GetAllAsyncInclude(
                o => o.EndDate < DateTime.UtcNow || o.StartDate > DateTime.UtcNow
                );

            if (offers == null || !offers.Any())
                return NotFound("No inactive offers found.");

            return Ok(offers);
        }

        [HttpGet("getOffersActive")]
        public async Task<IActionResult> GetByAllActive()
        {
            var offers = await _offerRepository.GetAllAsyncInclude(
                o => o.EndDate > DateTime.UtcNow || o.StartDate < DateTime.UtcNow
                );

            if (offers == null || !offers.Any())
                return NotFound("No active offers found.");

            return Ok(offers);
        }

    }

}
