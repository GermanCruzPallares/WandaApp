import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Transaction, FrequencyType, SplitType } from '@/types/models'
import { apiService } from '@/services/apiService'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api'

export const useTransactionStore = defineStore('transaction', () => {

  // ==================== ESTADO ====================

  const transactionsByAccount = ref<Map<number, Transaction[]>>(new Map());

  // ==================== HELPERS ====================

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('wanda_auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const handleUnauthorized = () => {
    localStorage.removeItem('wanda_auth_token')
    localStorage.removeItem('wanda_user_id')
    window.location.href = '/login'
  }

  // ==================== API CALLS ====================

  /**
   * Obtener transacciones con filtros opcionales
   * Ejemplos:
   * - fetchTransactions(1) → Todas las transacciones
   * - fetchTransactions(1, { type: 'saving' }) → Solo aportaciones
   * - fetchTransactions(1, { objectiveId: 5 }) → Solo del objetivo 5
   * - fetchTransactions(1, { type: 'saving', objectiveId: 5 }) → Aportaciones del objetivo 5
   */
  const fetchTransactions = async (
    accountId: number,
    filters?: {
      objectiveId?: number
      type?: 'expense' | 'income' | 'saving'
    },
  ): Promise<Transaction[]> => {
    try {
      let url = `${API_BASE_URL}/accounts/${accountId}/transactions`;

      if (filters) {
        const params = new URLSearchParams();
        if (filters.objectiveId !== undefined) params.append('objectiveId', filters.objectiveId.toString());
        if (filters.type) params.append('type', filters.type);
        const query = params.toString();
        if (query) url += `?${query}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) { handleUnauthorized(); return []; }
      if (response.status === 404) return [];
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const transactions = await response.json();

      if (!filters) {
        transactionsByAccount.value.set(accountId, transactions)
      }

      return transactions;

      return transactions
    } catch (error) {
      console.error('Error fetchTransactions:', error);
      return [];
    }
  }

  /**
   * Obtener aportaciones (con objetivo opcional)
   * Ejemplos:
   * - fetchSavings(1) → Todas las aportaciones
   * - fetchSavings(1, 5) → Aportaciones del objetivo 5
   */
  const fetchSavings = async (
    accountId: number,
    objectiveId?: number
  ): Promise<Transaction[]> => {
    return fetchTransactions(accountId, {
      type: 'saving',
      ...(objectiveId !== undefined && { objectiveId }),
    })
  }

  /**
   * Obtener todas las transacciones de un objetivo
   */
  const fetchTransactionsByObjective = async (
    accountId: number,
    objectiveId: number,
  ): Promise<Transaction[]> => {
    return fetchTransactions(accountId, { objectiveId })
  }

  const fetchTransactionById = async (transactionId: number): Promise<Transaction | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Error fetchTransactionById:', error);
      return null;
    }
  }

  /**
   * Crear una transacción
   */
  const createTransaction = async (
    accountId: number,
    data: {
      objective_id: number
      category: string
      amount: number
      transaction_type: 'expense' | 'income' | 'saving'
      concept: string
      transaction_date: Date | string
      isRecurring?: boolean
      frequency?: FrequencyType
      end_date?: Date | string | null
      split_type: string
      customSplits: null
    },
  ): Promise<boolean> => {
    try {
      await apiService.createTransaction(accountId, data as Partial<Transaction>)

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      transactionsByAccount.value.delete(accountId);
      await fetchTransactions(accountId);

      return true;

      return true
    } catch (error) {
      console.error('Error createTransaction:', error);
      throw error;
    }
  }

  /**
   * Actualizar una transacción
   */
  const updateTransaction = async (
    transactionId: number,
    updates: {
      category?: string
      amount?: number
      transaction_type?: 'expense' | 'income' | 'saving'
      concept?: string | null
      transaction_date?: Date | string
      isRecurring?: boolean
      frequency?: FrequencyType
      end_date?: Date | string | null
      split_type?: SplitType
    },
  ): Promise<boolean> => {
    try {
      await apiService.updateTransaction(transactionId, updates as Partial<Transaction>)
      console.log('✅ Transacción actualizada')

      if (!response.ok) throw new Error(`Error ${response.status}`);

      transactionsByAccount.value.clear();

      return true;

      return true
    } catch (error) {
      console.error('Error updateTransaction:', error);
      throw error;
    }
  }

  /**
   * Eliminar una transacción
   */
  const deleteTransaction = async (
    transactionId: number,
    accountId?: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      if (accountId) {
        transactionsByAccount.value.delete(accountId)
        await fetchTransactions(accountId)
      } else {
        transactionsByAccount.value.clear()
      }

      return true
    } catch (error) {
      console.error('Error deleteTransaction:', error);
      throw error;
    }
  }

  // ==================== UTILIDADES ====================

  const getTransactionsFromCache = (accountId: number): Transaction[] | null => {
    return transactionsByAccount.value.get(accountId) || null
  }

  const clearCache = (accountId?: number) => {
    if (accountId) {
      transactionsByAccount.value.delete(accountId)
    } else {
      transactionsByAccount.value.clear()
    }
  }

  const refreshTransactions = async (accountId: number): Promise<Transaction[]> => {
    transactionsByAccount.value.delete(accountId)
    return await fetchTransactions(accountId)
  }

  // ==================== RETURN ====================

  return {
    transactionsByAccount,
    fetchTransactions,
    fetchSavings,
    fetchTransactionsByObjective,
    fetchTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsFromCache,
    clearCache,
    refreshTransactions,
  }
})
