using Models;

namespace wandaAPI.Services
{
    public interface IUserService
    {
        Task<List<User>> GetAllAsync(string? email = null);
        Task<User?> GetByIdAsync(int id);
        Task AddAsync(UserCreateDTO user1); //Registra usaurios con role:user y automaticamente crea su cuenta en wanda
        Task AddAdminAsync(UserCreateDTO adminDto); //Registra admins
        Task UpdateAsync(int id, UserUpdateDTO user1);
        Task DeleteAsync(int id);

        Task<List<Account>> GetUserAccountsAsync(int userId);

    }
}
