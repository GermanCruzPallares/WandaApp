using Models;

namespace wandaAPI.Services
{
    public interface ITransactionService
    {
        Task<List<Transaction>> GetByAccountAsync(int accountId);
        Task<Transaction?> GetByIdAsync(int id);
        
        /// <summary>
        /// =========================================================================================================
        /// 1. CREACIÓN DE TRANSACCIONES 
        /// Lógica: 
        ///    a) Determina quién paga realmente (Cuenta Personal vs Conjunta).
        ///    b) Mueve el dinero físico (Actualiza saldo).
        ///    c) Genera la transacción oficial (Historial).
        ///    d) Crea "Transacción Espejo" en la cuenta personal para tracking individual.
        ///    e) Genera deudas (Splits) si es un gasto compartido.
        /// =========================================================================================================
        /// </summary>
        /// <param name="accountId">ID de la cuenta destino (del path)</param>
        /// <param name="userId">ID del usuario que realiza la transacción (del token JWT)</param>
        /// <param name="dto">Datos de la transacción</param>
        /// <returns>La transacción creada</returns>
        Task<Transaction> CreateAsync(int accountId, int userId, TransactionCreateDTO dto);
        
        /// <summary>
        /// Actualiza una transacción existente.
        /// NOTA: No permite editar transacciones con split_type = "divided" para mantener integridad de deudas.
        /// </summary>
        /// <param name="id">ID de la transacción a actualizar</param>
        /// <param name="dto">Nuevos datos de la transacción</param>
        Task UpdateAsync(int id, TransactionUpdateDTO dto);
        
        Task DeleteAsync(int id);

        /// <summary>
        /// Procesa todas las transacciones recurrentes pendientes de ejecución.
        /// Ejecutado automáticamente por el Worker o manualmente vía endpoint de CRON.
        /// </summary>
        Task ProcessRecurringTransactionsAsync();
    }
}