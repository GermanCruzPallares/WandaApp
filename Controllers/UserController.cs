using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using wandaAPI.Repositories;
using wandaAPI.Services;


namespace wandaAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public UserController(IUserService userService, IConfiguration configuration) // este esta bien 
        {
            _userService = userService;
            _configuration = configuration;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetUsers([FromQuery] string? email)
        {

            var Users = await _userService.GetAllAsync(email);
            return Ok(Users);
        }

        [Authorize]
        [HttpGet("{userId}")]
        public async Task<ActionResult<User>> GetUserById(int userId)
        {
            try
            {
                var User = await _userService.GetByIdAsync(userId);
                return Ok(User);
            }

            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


        [Authorize]
        [HttpGet("{userId}/accounts")]
        public async Task<ActionResult<List<Account>>> GetUserAccounts(int userId)
        {
            if (userId <= 0) return BadRequest("ID de usuario inválido.");

            try
            {
                var accounts = await _userService.GetUserAccountsAsync(userId);
                return Ok(accounts);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserUpdateDTO updatedUser)
        {

            if (userId <= 0) return BadRequest("El ID no es válido");

            try
            {
                var existingUser = await _userService.GetByIdAsync(userId);
                if (existingUser == null)
                {
                    return NotFound();
                }

                await _userService.UpdateAsync(userId, updatedUser);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {

            try
            {
                if (userId <= 0)
                {
                    return BadRequest("El ID no es válido");
                }
                await _userService.DeleteAsync(userId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {

                return NotFound(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")] 
        [HttpGet("stats")]
        public async Task<ActionResult> GetSystemStats()
        {
            try
            {
                
                var allUsers = await _userService.GetAllAsync();

                return Ok(new
                {
                    TotalUsers = allUsers.Count,
                    TotalAdmins = allUsers.Count(u => u.Role == "Admin"),
                    TotalRegularUsers = allUsers.Count(u => u.Role == "User")
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


    }
}