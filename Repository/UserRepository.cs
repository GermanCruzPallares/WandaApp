using Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models.DTOS; // Asegúrate de tener esto para IConfiguration

namespace wandaAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("wandaDb") ?? "Not found";
        }

        public async Task<List<User>> GetAllAsync()
        {
            var users = new List<User>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = "SELECT user_id, name, email, password, role FROM USERS";
                using (var command = new SqlCommand(query, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var User = new User
                            {
                                User_id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Email = reader.GetString(2),
                                Password = reader.GetString(3),
                                Role = reader.GetString(4)
                            };

                            users.Add(User);
                        }
                    }
                }
            }
            return users;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            User user1 = null;

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = "SELECT user_id, name, email, password, role FROM USERS WHERE user_id = @user_id";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@user_id", id);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            user1 = new User
                            {
                                User_id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Email = reader.GetString(2),
                                Password = reader.GetString(3),
                                Role = reader.GetString(4)
                            };
                        }
                    }
                }
            }
            return user1;
        }

        public async Task<int> AddAsync(User user1)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = "INSERT INTO USERS (name, email, password, role) VALUES (@name, @email, @password, @role); SELECT SCOPE_IDENTITY();";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@name", user1.Name);
                    command.Parameters.AddWithValue("@email", user1.Email);
                    command.Parameters.AddWithValue("@password", user1.Password);
                    command.Parameters.AddWithValue("@role", string.IsNullOrEmpty(user1.Role) ? "User" : user1.Role);
                    var result = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(result);
                }
            }
        }

        public async Task UpdateAsync(User user1)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

        
                string query = "UPDATE USERS SET name = @name, email = @email, password = @password, role = @role WHERE user_id = @user_id";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@user_id", user1.User_id);
                    command.Parameters.AddWithValue("@name", user1.Name);
                    command.Parameters.AddWithValue("@email", user1.Email);
                    command.Parameters.AddWithValue("@password", user1.Password);
          
                    command.Parameters.AddWithValue("@role", string.IsNullOrEmpty(user1.Role) ? "User" : user1.Role);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = "DELETE FROM USERS WHERE user_id = @user_id";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@user_id", id);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<List<User>> GetByAccountIdAsync(int accountId)
        {
            var users = new List<User>();
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

              
                string query = @"
            SELECT u.user_id, u.name, u.email, u.password, u.role 
            FROM USERS u 
            JOIN ACCOUNT_USERS au ON u.user_id = au.user_id 
            WHERE au.account_id = @account_id";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@account_id", accountId);
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            users.Add(new User
                            {
                                User_id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Email = reader.GetString(2),
                                Password = reader.GetString(3),
                                Role = reader.GetString(4)
                            });
                        }
                    }
                }
            }
            return users;
        }


        public async Task<SystemStatsDto> GetSystemStatsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = @"
            SELECT 
                (SELECT COUNT(*) FROM USERS) as TotalUsers,
                (SELECT COUNT(*) FROM USERS WHERE role = 'Admin') as TotalAdmins,
                (SELECT COUNT(*) FROM USERS WHERE role = 'User') as TotalRegular,
                (SELECT COUNT(*) FROM ACCOUNTS) as TotalAccounts,
                (SELECT COUNT(*) FROM ACCOUNTS WHERE account_type = 'personal') as TotalPersonal,
                (SELECT COUNT(*) FROM ACCOUNTS WHERE account_type = 'joint') as TotalJoint,
                (SELECT COUNT(*) FROM TRANSACTIONS) as TotalTransactions,
                (SELECT SUM(amount) FROM ACCOUNTS WHERE account_type = 'personal') as TotalBalance";

                using (var command = new SqlCommand(query, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new SystemStatsDto
                            {
                                Users = new UserStatsDto
                                {
                                    Total = reader.GetInt32(0),
                                    Admins = reader.GetInt32(1),
                                    RegularUsers = reader.GetInt32(2)
                                },
                                Accounts = new AccountStatsDto
                                {
                                    Total = reader.GetInt32(3),
                                    Personal = reader.GetInt32(4),
                                    Joint = reader.GetInt32(5)
                                },
                                Financials = new FinancialStatsDto
                                {
                                    TotalTransactions = reader.GetInt32(6),
                                    TotalSystemBalance = reader.IsDBNull(7) ? 0 : Convert.ToDouble(reader.GetDecimal(7))
                                }
                            };
                        }
                    }
                }
            }
            return new SystemStatsDto();
        }
    }
}