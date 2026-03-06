namespace wandaAPI.Helpers
{
    public class FileValidationHelper
    {
        private readonly string[] _allowedMimeTypes;
        private readonly string[] _allowedExtensions;

        public FileValidationHelper(string[] allowedMimeTypes, string[] allowedExtensions)
        {
            _allowedMimeTypes = allowedMimeTypes;
            _allowedExtensions = allowedExtensions;
        }

        public void Validate(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("El archivo está vacío o no existe.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!_allowedMimeTypes.Contains(file.ContentType) || !_allowedExtensions.Contains(extension))
            {
                throw new InvalidOperationException("Formato de archivo no permitido.");
            }
        }
    }
}