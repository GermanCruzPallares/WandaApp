using Models;

namespace wandaAPI.Services
{
    public interface IUserService
    {
        Task<List<User>> GetAllAsync(string? email = null);
        Task<User?> GetByIdAsync(int id);
        Task AddAsync(UserCreateDTO user1);
        Task UpdateAsync(int id, UserUpdateDTO user1);
        Task DeleteAsync(int id);

        Task<List<Account>> GetUserAccountsAsync(int userId);

    }
}
