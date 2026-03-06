using Microsoft.AspNetCore.Http;
namespace Models;

public class AccountUpdateDto
{
    public string Name { get; set; }

    public double Amount { get; set; }

    public double Weekly_budget { get; set; }

    public double Monthly_budget { get; set; }

    public IFormFile? ImageFile { get; set; }
    public string? Account_picture_url { get; set; }


    public AccountUpdateDto()
    {
        
    }

}