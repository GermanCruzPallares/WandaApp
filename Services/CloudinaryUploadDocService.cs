using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using wandaAPI.Helpers; // Ajusta según donde pongas el validador

namespace wandaAPI.Services
{
    public class CloudinaryUploadDocService : IUploadDocService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryUploadDocService(IConfiguration configuration)
        {
            var cloudName = configuration["CloudinarySettings:CloudName"];
            var apiKey = configuration["CloudinarySettings:ApiKey"];
            var apiSecret = configuration["CloudinarySettings:ApiSecret"];
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            var imageValidator = new FileValidationHelper(
                new[] { "image/jpeg", "image/png", "image/gif" },
                new[] { ".jpg", ".jpeg", ".png", ".gif" }
            );
            imageValidator.Validate(file);

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Width(400).Height(400).Crop("fill")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl?.ToString();
        }

        public async Task<string> UploadPDFAsync(IFormFile file)
        {
            var pdfValidator = new FileValidationHelper(
                new[] { "application/pdf" },
                new[] { ".pdf" }
            );
            pdfValidator.Validate(file);

            using var stream = file.OpenReadStream();
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream)
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl?.ToString();
        }

        // Método para borrar imágenes
        public async Task DeleteImageAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Result != "ok")
            {
                throw new Exception($"Error al eliminar la imagen de Cloudinary: {result.Error?.Message}");
            }
        }

        // Método para borrar documentos (PDFs/Raw)
        public async Task DeleteDocAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Raw // Importante para archivos que no son imágenes
            };
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Result != "ok")
            {
                throw new Exception($"Error al eliminar el documento de Cloudinary: {result.Error?.Message}");
            }
        }
    }
}