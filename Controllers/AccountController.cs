using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using wandaAPI.Repositories;
using wandaAPI.Services;

namespace wandaAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IUploadDocService _uploadService;

        public AccountController(IAccountService accountRepository, IUploadDocService uploadService)
        {
            _accountService = accountRepository;
            _uploadService = uploadService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Account>>> GetAccounts()
        {
            var accounts = await _accountService.GetAllAsync();
            return Ok(accounts);
        }

        [HttpGet("{accountId}")]
        public async Task<ActionResult<Account>> GetAccountById(int accountId)
        {
            var account = await _accountService.GetByIdAsync(accountId);
            if (account == null) return NotFound("Cuenta no encontrada");
            return Ok(account);
        }


        [HttpGet("{accountId}/users")]
        public async Task<ActionResult<List<User>>> GetAccountMembers(int accountId)
        {
            if (accountId <= 0) return BadRequest("ID de cuenta inválido.");

            try
            {
                var members = await _accountService.GetMembersAsync(accountId);
                return Ok(members);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]

        public async Task<ActionResult> CreateAccount([FromBody] JointAccountCreateDto account)
        {

            await _accountService.AddJointAccountAsync(account);
            return Ok("Joint Account creada exitosamente");
        }

        [HttpPut("{accountId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateAccount(int accountId, [FromForm] AccountUpdateDto accountDto)
        {
            try
            {

                if (accountId <= 0) return BadRequest("El ID no es válido");

                var existingAccount = await _accountService.GetByIdAsync(accountId);
                if (existingAccount == null)
                {
                    return NotFound();
                }

                await _accountService.UpdateAsync(accountId, accountDto);
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

        [HttpDelete("{accountId}")]
        public async Task<IActionResult> DeleteAccount(int accountId)
        {
            try
            {
                await _accountService.DeleteAsync(accountId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("uploadImage")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("El archivo está vacío");

            // Siguiendo tu ejemplo que llama a UploadImageAsync o UploadPDFAsync
            var imageUrl = await _uploadService.UploadImageAsync(file);

            if (string.IsNullOrEmpty(imageUrl))
            {
                return BadRequest("Error al cargar la imagen en Cloudinary.");
            }

            // Devuelve la URL para que el frontend la use luego en el PUT
            return Ok(new { Url = imageUrl });
        }

        // ENDPOINT PARA ELIMINAR IMAGEN (Copiando el estilo de tu ejemplo)
        [HttpDelete("deleteImage")]
        public async Task<IActionResult> Delete(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
                return BadRequest("El identificador (publicId) no puede estar vacío.");

            await _uploadService.DeleteImageAsync(publicId);
            return NoContent();
        }

    }
}