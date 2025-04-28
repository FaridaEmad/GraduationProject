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
    public class PaymentMethodController : ControllerBase
    {
        private readonly IDataRepository<PaymentMethod> _paymentMethodRepository;

        public PaymentMethodController(IDataRepository<PaymentMethod> paymentMethodRepository)
        {
            _paymentMethodRepository = paymentMethodRepository;
        }

        [HttpGet("getAllMethods")]
        public async Task<IActionResult> GetAllMethods()
        {
            return Ok(await _paymentMethodRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMethodById(int id)
        {
            var method = await _paymentMethodRepository.GetByIdAsync(id);
            if (method == null)
            {
                return NotFound("Method not found");
            }

            return Ok(method);
        }

        //[Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateMethod(int id, PaymentMethodDto newMethod)
        {
            var method = await _paymentMethodRepository.GetByIdAsync(id);
            if (method == null)
            {
                return NotFound("Payment Method not found.");
            }

            method.Method = newMethod.Method;
            method.Fees = newMethod.Fees;

            await _paymentMethodRepository.UpdateAsync(method);
            await _paymentMethodRepository.Save();

            return Ok("Method updated successfully.");
        }

        //[Authorize(Roles = "Admin")]
        [HttpPost("addNewMethod")]
        public async Task<ActionResult> addMethod(PaymentMethodDto newMethod)
        {
            var method = new PaymentMethod
            {
                Method = newMethod.Method,
                Fees = newMethod.Fees
            };

            await _paymentMethodRepository.AddAsync(method);
            await _paymentMethodRepository.Save();

            return Ok("Payment method added successfully");

        }

        //[Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMethod(int id)
        {
            var method = await _paymentMethodRepository.GetByIdAsync(id);
            if (method == null)
            {
                return NotFound();
            }

            await _paymentMethodRepository.DeleteAsync(method);
            await _paymentMethodRepository.Save();
            return Ok("deleted successfuly");
        }

    }
}
