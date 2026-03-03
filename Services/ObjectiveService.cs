using Models;
using DTOs;
using wandaAPI.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Reflection.Metadata.Ecma335;
using System.Runtime;

namespace wandaAPI.Services
{
    public class ObjectiveService : IObjectiveService
    {
        private readonly IObjectiveRepository _objectiveRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IAccountRepository _accountRepository;

        public ObjectiveService(
            IObjectiveRepository objectiveRepository,
            ITransactionRepository transactionRepository,
            IAccountRepository accountRepository)
        {
            _objectiveRepository = objectiveRepository;
            _transactionRepository = transactionRepository;
            _accountRepository = accountRepository;
        }


        private void ValidateObjectiveData(string name, double targetAmount, double currentSave, DateTime deadline)
        {

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("El nombre del objetivo es obligatorio.");


            if (targetAmount <= 0)
                throw new ArgumentException("La meta de ahorro debe ser un monto mayor a 0.");


            if (currentSave < 0)
                throw new ArgumentException("El ahorro actual no puede ser un valor negativo.");


            if (targetAmount < currentSave)
                throw new ArgumentException("La meta de ahorro no puede ser inferior al monto ya ahorrado.");


            if (deadline <= DateTime.Now)
                throw new ArgumentException("La fecha límite debe ser una fecha futura.");
        }

        public async Task<List<Objective>> GetByAccountAsync(int accountId, bool? isCompleted = null, bool? isArchived = null)
        {
            if (accountId <= 0) throw new ArgumentException("El ID de cuenta no es válido.");


            var objectives = await _objectiveRepository.GetByAccountIdAsync(accountId);


            var query = objectives.AsEnumerable();

            if (isCompleted.HasValue)
            {
                query = query.Where(o => o.Is_completed == isCompleted.Value);
            }

            if (isArchived.HasValue)
            {
                query = query.Where(o => o.Is_archived == isArchived.Value);
            }

            return query.ToList();
        }

        public async Task<Objective> CreateAsync(int accountId, ObjectiveCreateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            ValidateObjectiveData(dto.Name, dto.Target_amount, 0, dto.Deadline);

            var objective = new Objective
            {
                Account_id = accountId,
                Name = dto.Name,
                Target_amount = dto.Target_amount,
                Current_save = 0,
                Deadline = dto.Deadline,
                Is_completed = false,
                Is_archived = false
            };

            int id = await _objectiveRepository.AddAsync(objective);
            objective.Objective_id = id;

            return objective;
        }

        public async Task<Objective?> GetByIdAsync(int id)
        {
            var objective = await _objectiveRepository.GetByIdAsync(id);
            if (objective == null) throw new KeyNotFoundException("El objetivo no existe.");
            return objective;
        }

        public async Task AddFundsAsync(int id, double amount)
        {
            if (amount <= 0) throw new ArgumentException("El monto debe ser positivo.");

            var objective = await _objectiveRepository.GetByIdAsync(id);
            if (objective == null) throw new KeyNotFoundException("Objetivo no encontrado.");


            if (objective.Current_save + amount > objective.Target_amount)
            {
                double restante = objective.Target_amount - objective.Current_save;
                throw new InvalidOperationException(
                    $"La aportación de {amount}€ excede el objetivo '{objective.Name}'. " +
                    $"Solo faltan {restante}€ para completarlo.");
            }

            objective.Current_save += amount;


            objective.Is_completed = objective.Current_save >= objective.Target_amount;

            await _objectiveRepository.UpdateAsync(objective);
        }
        public async Task UpdateAsync(int id, ObjectiveUpdateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var objective = await _objectiveRepository.GetByIdAsync(id);
            if (objective == null) throw new KeyNotFoundException("El objetivo no existe.");

            ValidateObjectiveData(dto.Name, dto.Target_amount, dto.Current_save, dto.Deadline);

            objective.Name = dto.Name;
            objective.Target_amount = dto.Target_amount;
            objective.Current_save = dto.Current_save;
            objective.Deadline = dto.Deadline;

           
            objective.Is_completed = objective.Current_save >= objective.Target_amount;

            await _objectiveRepository.UpdateAsync(objective);
        }

        public async Task DeleteAsync(int id)
        {
            var objective = await _objectiveRepository.GetByIdAsync(id);
            if (objective == null) throw new KeyNotFoundException("El objetivo no existe.");


            var transactions = await _transactionRepository.GetTransactionsByObjectiveAsync(id);

            foreach (var tx in transactions)
            {
                var account = await _accountRepository.GetByIdAsync(tx.Account_id);
                if (account != null)
                {
                    account.Amount += tx.Amount;
                    await _accountRepository.UpdateAsync(account);
                }
            }
            await _objectiveRepository.DeleteTransactionsByObjectiveAsync(id);
            await _objectiveRepository.DeleteAsync(id);
        }
    }
}