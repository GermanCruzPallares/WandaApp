using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Models.DTOS;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using wandaAPI.Repositories;
using wandaAPI.Services;

namespace wandaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {

            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Email == loginDto.Email);

            if (user == null) return Unauthorized("Usuario no encontrado.");


            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized("Contraseña incorrecta.");
            }

            // Generar Token
            var tokenHandler = new JwtSecurityTokenHandler();

            // IMPORTANTE: Usar UTF8 para coincidir con Program.cs
            var key = Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.User_id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role ?? "User") 
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["JWT:ValidIssuer"],
                Audience = _configuration["JWT:ValidAudience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString, UserId = user.User_id });
        }
    }
}