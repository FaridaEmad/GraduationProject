using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using DealsHub.Models;
using DealsHub.Dtos;
using DealsHub.Data;
using Microsoft.AspNetCore.Authorization;

namespace DealsHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;

        private readonly IDataRepository<Phone> _phoneRepository;
        private readonly IDataRepository<User> _userRepository;
        private readonly IDataRepository<Cart> _cartRepository;

        public AuthController(IAuthRepository repo, IConfiguration config, IDataRepository<Phone> phoneRepository, IDataRepository<User> userRepository, IDataRepository<Cart> cartRepository)
        {
            _config = config;
            _repo = repo;
            _phoneRepository = phoneRepository;
            _userRepository = userRepository;
            _cartRepository = cartRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto userForLoginDto)
        {
            var userFromRepo = await _repo.Login(userForLoginDto.Email.ToLower(), userForLoginDto.Password);

            if (userFromRepo == null)
            {
                return Unauthorized("wrong email or password!");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userFromRepo.UserId.ToString()),
                new Claim(ClaimTypes.Email, userFromRepo.Email),
                new Claim(ClaimTypes.Name, userFromRepo.Name),
                new Claim(ClaimTypes.Role, userFromRepo.IsAdmin ? "Admin" : "Customer"),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(_config.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                NotBefore = DateTime.Now,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto userForRegisterDto)
        {

            userForRegisterDto.Email = userForRegisterDto.Email.ToLower();
            if (await _repo.UserExist(userForRegisterDto.Email))
            {
                return BadRequest("Email already exists");
            }

            var userToCreate = new User()
            {
                Name = userForRegisterDto.Name,
                Email = userForRegisterDto.Email,
                CreatedAt = DateTime.Now,
                IsAdmin = false,
                Gender = userForRegisterDto.Gender,
                ProfilePhoto = userForRegisterDto.ProfilePhoto
            };

            User createdUser = await _repo.Register(userToCreate, userForRegisterDto.Password);

            var phone = new Phone()
            {
                UserId = createdUser.UserId,
                Number = userForRegisterDto.Phone
            };

            await _phoneRepository.AddAsync(phone);
            await _phoneRepository.Save();

            var cart = new Cart()
            {
                UserId = createdUser.UserId,
                IsActive = true,
                NoOfItems = 0,
                TotalAmount = 0
            };

            await _cartRepository.AddAsync(cart);
            await _cartRepository.Save();

            return Ok();

        }

        //[Authorize(Roles = "Admin")]
        [HttpPost("addAdmin")]
        public async Task<IActionResult> addAdmin(RegisterDto userForRegisterDto)
        {

            userForRegisterDto.Email = userForRegisterDto.Email.ToLower();
            if (await _repo.UserExist(userForRegisterDto.Email))
            {
                return BadRequest("Email already exists");
            }

            var userToCreate = new User()
            {
                Name = userForRegisterDto.Name,
                Email = userForRegisterDto.Email,
                CreatedAt = DateTime.Now,
                IsAdmin = true,
                Gender = userForRegisterDto.Gender,
                ProfilePhoto = userForRegisterDto.ProfilePhoto
            };

            User createdUser = await _repo.Register(userToCreate, userForRegisterDto.Password);

            var phone = new Phone()
            {
                UserId = createdUser.UserId,
                Number = userForRegisterDto.Phone
            };

            await _phoneRepository.AddAsync(phone);
            await _phoneRepository.Save();

            return Ok();

        }

        [HttpPut("changePassword/{id}")]
        public async Task<ActionResult> ChangePassword(int id, string newPass)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var updatedUser = await _repo.ChangePassword(user, newPass);

            await _userRepository.UpdateAsync(updatedUser);
            await _userRepository.Save();

            return Ok("Password updated successfully.");
        }

        [HttpPut("forgetPassword")]
        public async Task<ActionResult> forgetPassword(string email , string newPass)
        {
            var updatedUser = await _repo.forgetPassword(email, newPass);

            await _userRepository.UpdateAsync(updatedUser);
            await _userRepository.Save();

            return Ok("Password updated successfully.");
        }

        [HttpPut("changePhoto/{id}")]
        public async Task<ActionResult> ChangePhoto(int id, string newPhoto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.ProfilePhoto = newPhoto;

            await _userRepository.UpdateAsync(user);
            await _userRepository.Save();

            return Ok("Photo updated successfully.");
        }
    }
}
