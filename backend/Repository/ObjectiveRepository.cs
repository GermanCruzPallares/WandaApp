using Models;
using Microsoft.Data.SqlClient;

namespace wandaAPI.Repositories
{
    public class ObjectiveRepository : IObjectiveRepository
    {
        private readonly string _connectionString;

        public ObjectiveRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("wandaDb") ?? throw new ArgumentNullException("Connection string not found");
        }

        public async Task<List<Objective>> GetByAccountIdAsync(int accountId)
        {
            var objectives = new List<Objective>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                string query = @"SELECT objective_id, account_id, name, target_amount, current_save, deadline, is_completed, is_archived 
                                 FROM OBJECTIVES 
                                 WHERE account_id = @account_id";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@account_id", accountId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            objectives.Add(new Objective
                            {
                                Objective_id = reader.GetInt32(0),
                                Account_id = reader.GetInt32(1),
                                Name = reader.GetString(2),
                                Target_amount = reader.IsDBNull(3) ? 0 : Convert.ToDouble(reader.GetDecimal(3)),
                                Current_save = reader.IsDBNull(4) ? 0 : Convert.ToDouble(reader.GetDecimal(4)),
                                Deadline = reader.GetDateTime(5),
                                Is_completed = reader.GetBoolean(6),
                                Is_archived = reader.GetBoolean(7) 
                            });
                        }
                    }
                }
            }
            return objectives;
        }

        public async Task<Objective?> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = "SELECT objective_id, account_id, name, target_amount, current_save, deadline, is_completed, is_archived FROM OBJECTIVES WHERE objective_id = @objective_id";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@objective_id", id);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Objective
                            {
                                Objective_id = reader.GetInt32(0),
                                Account_id = reader.GetInt32(1),
                                Name = reader.GetString(2),
                                Target_amount = reader.IsDBNull(3) ? 0 : Convert.ToDouble(reader.GetDecimal(3)),
                                Current_save = reader.IsDBNull(4) ? 0 : Convert.ToDouble(reader.GetDecimal(4)),
                                Deadline = reader.GetDateTime(5),
                                Is_completed = reader.GetBoolean(6),
                                Is_archived = reader.GetBoolean(7)
                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task<int> AddAsync(Objective objective)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = @"INSERT INTO OBJECTIVES (account_id, name, target_amount, current_save, deadline, is_completed, is_archived) 
                                 VALUES (@account_id, @name, @target_amount, @current_save, @deadline, @is_completed, @is_archived);
                                 SELECT SCOPE_IDENTITY();";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@account_id", objective.Account_id);
                    command.Parameters.AddWithValue("@name", objective.Name);
                    command.Parameters.AddWithValue("@target_amount", objective.Target_amount);
                    command.Parameters.AddWithValue("@current_save", objective.Current_save);
                    command.Parameters.AddWithValue("@deadline", objective.Deadline);
                    command.Parameters.AddWithValue("@is_completed", objective.Is_completed);
                    command.Parameters.AddWithValue("@is_archived", objective.Is_archived);

                    var result = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(result);
                }
            }
        }

        public async Task UpdateAsync(Objective objective)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = @"UPDATE OBJECTIVES SET name = @name, target_amount = @target_amount, current_save = @current_save, 
                                 deadline = @deadline, is_completed = @is_completed, is_archived = @is_archived 
                                 WHERE objective_id = @objective_id";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@objective_id", objective.Objective_id);
                    command.Parameters.AddWithValue("@name", objective.Name);
                    command.Parameters.AddWithValue("@target_amount", objective.Target_amount);
                    command.Parameters.AddWithValue("@current_save", objective.Current_save);
                    command.Parameters.AddWithValue("@deadline", objective.Deadline);
                    command.Parameters.AddWithValue("@is_completed", objective.Is_completed);
                    command.Parameters.AddWithValue("@is_archived", objective.Is_archived);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        string deleteTransactions = "DELETE FROM TRANSACTIONS WHERE objective_id = @objective_id";
                        using (var cmd1 = new SqlCommand(deleteTransactions, connection, transaction))
                        {
                            cmd1.Parameters.AddWithValue("@objective_id", id);
                            await cmd1.ExecuteNonQueryAsync();
                        }

                        string deleteObjective = "DELETE FROM OBJECTIVES WHERE objective_id = @objective_id";
                        using (var cmd2 = new SqlCommand(deleteObjective, connection, transaction))
                        {
                            cmd2.Parameters.AddWithValue("@objective_id", id);
                            await cmd2.ExecuteNonQueryAsync();
                        }

                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }
            }
        }

        public async Task ClearObjectiveFromTransactionsAsync(int objectiveId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = "UPDATE TRANSACTIONS SET objective_id = NULL WHERE objective_id = @objective_id";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@objective_id", objectiveId);
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteTransactionsByObjectiveAsync(int objectiveId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = "DELETE FROM TRANSACTIONS WHERE objective_id = @objective_id AND transaction_type = 'saving'";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@objective_id", objectiveId);
                    await command.ExecuteNonQueryAsync();
                }
            }
        }
    }
}