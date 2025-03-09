using DealsHub.Dtos;
using DealsHub.Models;
using GraduationProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class OffersController : ControllerBase
{
    private readonly DealsHubDbContext _context;

    public OffersController(DealsHubDbContext context)
    {
        _context = context;
    }

    // ✅ 1. جلب كل العروض
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Offer>>> GetOffers()
    {
        return await _context.Offers.Include(o => o.Business).ToListAsync();
    }

    // ✅ 2. جلب عرض معين حسب ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOfferById(int id)
    {
        var offer = await _context.Offers
            .Include(o => o.Business) // لضم بيانات النشاط التجاري
            .FirstOrDefaultAsync(o => o.OfferId == id);

        if (offer == null)
        {
            return NotFound();
        }

        var offerDto = new OfferDto
        {
            OfferId = offer.OfferId,
            StartDate = offer.StartDate,
            EndDate = offer.EndDate,
            DiscountPercentage = offer.DiscountPercentage,
            Description = offer.Description,
            Price = offer.Price,
            BusinessId = offer.BusinessId,
            Business = new BusinessDto
            {
                Name = offer.Business.Name,
                City = offer.Business.City,
                Area = offer.Business.Area,
                CategoryId = offer.Business.CategoryId,
                UserId = offer.Business.UserId
            }
        };

        return Ok(offerDto);
    }


    // ✅ 3. إنشاء عرض جديد
    [HttpPost]
    public async Task<IActionResult> CreateOffer([FromBody] OfferDto offerDto)
    {
        var business = await _context.Businesses.FindAsync(offerDto.BusinessId);
        if (business == null)
        {
            return NotFound("Business not found");
        }

        var offer = new Offer
        {
            StartDate = offerDto.StartDate,
            EndDate = offerDto.EndDate,
            DiscountPercentage = offerDto.DiscountPercentage,
            Description = offerDto.Description,
            Price = offerDto.Price,
            BusinessId = offerDto.BusinessId,
            Business = business // ربط العرض بالنشاط التجاري
        };

        _context.Offers.Add(offer);
        await _context.SaveChangesAsync();

        // تحويل الـ Offer إلى OfferDto مع تفاصيل Business
        var offerResponse = new OfferDto
        {
            OfferId = offer.OfferId,
            StartDate = offer.StartDate,
            EndDate = offer.EndDate,
            DiscountPercentage = offer.DiscountPercentage,
            Description = offer.Description,
            Price = offer.Price,
            BusinessId = offer.BusinessId,
            Business = new BusinessDto
            {
                Name = offer.Business.Name,
                City = offer.Business.City,
                Area = offer.Business.Area,
                CategoryId = offer.Business.CategoryId,
                UserId = offer.Business.UserId
            }
        };

        return CreatedAtAction(nameof(GetOfferById), new { id = offer.OfferId }, offerResponse);
    }


    // ✅ 4. تعديل عرض معين
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOffer(int id, Offer offer)
    {
        if (id != offer.OfferId)
        {
            return BadRequest();
        }

        var existingOffer = await _context.Offers.FindAsync(id);
        if (existingOffer == null)
        {
            return NotFound();
        }

        existingOffer.StartDate = offer.StartDate;
        existingOffer.EndDate = offer.EndDate;
        existingOffer.DiscountPercentage = offer.DiscountPercentage;
        existingOffer.Description = offer.Description;
        existingOffer.Price = offer.Price;
        existingOffer.BusinessId = offer.BusinessId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ✅ 5. حذف عرض معين
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOffer(int id)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound();
        }

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
