using DealsHub.Data;
using DealsHub.Models;
using DealsHub.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Authorization;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymnetController : ControllerBase
    {
        private readonly IDataRepository<Payment> _paymentRepository;
        private readonly IDataRepository<PaymentMethod> _paymentMethodRepository;
        private readonly IDataRepository<Cart> _cartRepository;

        public PaymnetController(IDataRepository<Payment> paymentRepository,
            IDataRepository<PaymentMethod> paymentMethodRepository,
            IDataRepository<Cart> cartRepository)
        {
            _paymentRepository = paymentRepository;
            _paymentMethodRepository = paymentMethodRepository;
            _cartRepository = cartRepository;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllPayments")]
        public async Task<IActionResult> GetAllPayments()
        {
            return Ok(await _paymentRepository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            return Ok(payment);
        }

        [HttpPost("addNewPayment")]
        public async Task<ActionResult> addPaymnet(PaymentDto newPayment)
        {
            var method = await _paymentMethodRepository.GetByIdAsync(newPayment.PaymentMethodId);
            var cart = await _cartRepository.GetByIdAsync(newPayment.CartId);
            
            if(cart.NoOfItems == 0)
            {
                return BadRequest("Nothing to pay.");
            }
            
            var payment = new Payment
            {
                UserId = newPayment.UserId,
                CartId = newPayment.CartId,
                PaymentMethodId = newPayment.PaymentMethodId,
                TotalPrice = cart.TotalAmount + (cart.TotalAmount * (decimal)method.Fees),
                Status = newPayment.PaymentMethodId == 1 ? "Pending" : "Confirmed"
            };

            await _paymentRepository.AddAsync(payment);
            await _paymentRepository.Save();

            if(payment.Status == "Confirmed")
            {
                cart.IsActive = false;
                await _cartRepository.UpdateAsync(cart);
                await _paymentRepository.Save();

                var newCart = new Cart
                {
                    UserId = cart.UserId,
                    TotalAmount = 0,
                    NoOfItems = 0,
                    IsActive = true
                };

                await _cartRepository.AddAsync(newCart);
                await _cartRepository.Save();
            }

            return Ok("Payment added successfully");

        }

        //[Authorize(Roles = "Admin")]
        [HttpPut("ConfirmPayment/{id}")]
        public async Task<ActionResult> ConfirmPayment(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
            {
                return NotFound("Payment not found.");
            }

            if(payment.Status == "Confirmed")
            {
                return BadRequest("Payment is already confirmed");
            }

            payment.Status = "Confirmed";

            await _paymentRepository.UpdateAsync(payment);
            await _paymentRepository.Save();

            return Ok("Payment confirmed successfully.");
        }

        //[Authorize(Roles = "Admin")]
        [HttpPut("FailPayment/{id}")]
        public async Task<ActionResult> FailPayment(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
            {
                return NotFound("Payment not found.");
            }

            if (payment.Status == "Failed")
            {
                return BadRequest("Payment is already failed");
            }

            payment.Status = "Failed";

            await _paymentRepository.UpdateAsync(payment);
            await _paymentRepository.Save();

            return Ok("Payment has been Failed.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            await _paymentRepository.DeleteAsync(payment);
            await _paymentRepository.Save();
            return Ok("deleted successfuly");
        }

        [HttpGet("getPaymentByUser{id}")]
        public async Task<IActionResult> GetByUser(int id)
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.UserId == id
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments found for this user.");

            return Ok(payments);
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getPaymentByMethod{id}")]
        public async Task<IActionResult> GetByMethod(int id)
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.PaymentMethodId == id
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments found for this method.");
            
            return Ok(payments);
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllPaymentsConfirmed")]
        public async Task<IActionResult> GetAllConfirmed()
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.Status == "Confirmed"
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments confirmed yet.");

            return Ok(payments);
        }

        [HttpGet("getPaymentsByUserConfirmed")]
        public async Task<IActionResult> GetByUserConfirmed(int id)
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.UserId == id && p.Status == "Confirmed"
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments confirmed yet.");
            
            return Ok(payments);
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllPaymentsPending")]
        public async Task<IActionResult> GetAllPending()
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.Status == "Pending"
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments Pending yet.");

            return Ok(payments);
        }

        [HttpGet("getPaymentsByUserPending")]
        public async Task<IActionResult> GetByUserPending(int id)
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.UserId == id && p.Status == "Pending"
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments Pending yet.");

            return Ok(payments);
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("getAllPaymentsFailed")]
        public async Task<IActionResult> GetAllFailed()
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.Status == "Failed"
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments failed .");

            return Ok(payments);
        }

        [HttpGet("getPaymentsByUserFailed")]
        public async Task<IActionResult> GetByUserFailed(int id)
        {
            var payments = await _paymentRepository.GetAllAsyncInclude(
                p => p.UserId == id && p.Status == "Failed"
                );

            if (payments == null || !payments.Any())
                return NotFound("No payments Failed.");

            return Ok(payments);
        }

    }
}
