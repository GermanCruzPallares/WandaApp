import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { TransactionSplit } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useTransactionSplitStore = defineStore('transactionSplit', () => {

  // ==================== ESTADO ====================

  // Cache: userId → splits
  const splitsByUser = ref<Map<number, TransactionSplit[]>>(new Map());

  // ==================== HELPERS ====================

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('wanda_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('wanda_auth_token');
    localStorage.removeItem('wanda_user_id');
    window.location.href = '/login';
  };

  // ==================== API CALLS ====================

  /**
   * ✅ NUEVO: Obtener todos los splits de una cuenta
   * GET /api/accounts/{accountId}/transactionSplits
   * Usado en el historial conjunto para saber quién participa en cada gasto divided
   */
  const fetchAccountSplits = async (accountId: number): Promise<TransactionSplit[]> => {
    try {
      const url = `${API_BASE_URL}/accounts/${accountId}/transactionSplits`;
      console.log(`📡 GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) { handleUnauthorized(); return []; }
      if (response.status === 404) return [];
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const splits: TransactionSplit[] = await response.json();
      console.log(`✅ ${splits.length} splits de cuenta cargados`);
      return splits;

    } catch (error) {
      console.error('❌ Error fetchAccountSplits:', error);
      return [];
    }
  };

  /**
   * Obtener splits del usuario con filtro opcional de estado
   * GET /api/users/{userId}/transactionSplits?status=pending|settled
   *
   * Ejemplos:
   * - fetchUserSplits(4)                  → Todos los splits
   * - fetchUserSplits(4, 'pending')       → Solo deudas pendientes
   * - fetchUserSplits(4, 'settled')       → Solo deudas pagadas
   */
  const fetchUserSplits = async (
    userId: number,
    status?: 'pending' | 'settled'
  ): Promise<TransactionSplit[]> => {
    try {
      let url = `${API_BASE_URL}/users/${userId}/transactionSplits`;
      if (status) url += `?status=${status}`;

      console.log(`📡 GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        handleUnauthorized();
        return [];
      }

      if (response.status === 404) {
        console.log('ℹ️ No hay splits');
        return [];
      }

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const splits: TransactionSplit[] = await response.json();
      console.log(`✅ ${splits.length} splits cargados`);

      // Cachear solo si no hay filtro (datos completos)
      if (!status) {
        splitsByUser.value.set(userId, splits);
      }

      return splits;

    } catch (error) {
      console.error('❌ Error fetchUserSplits:', error);
      return [];
    }
  };

  /**
   * Obtener splits de una transacción concreta filtrando desde el cache
   * Útil para saber quién participa en un gasto divided específico
   */
  const getSplitsByTransactionId = (
    userId: number,
    transactionId: number
  ): TransactionSplit[] => {
    const userSplits = splitsByUser.value.get(userId) ?? [];
    return userSplits.filter(s => s.transaction_id === transactionId);
  };

  /**
   * Aceptar/pagar una deuda
   * POST /api/transactionSplits/{splitId}/
   */
  const acceptDebt = async (splitId: number): Promise<boolean> => {
    try {
      console.log(`📡 POST /transactionSplits/${splitId}/`);

      const response = await fetch(`${API_BASE_URL}/transactionSplits/${splitId}/`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        handleUnauthorized();
        return false;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      console.log('✅ Deuda aceptada y liquidada');

      // Limpiar caché completo (el saldo y splits cambian)
      splitsByUser.value.clear();

      return true;

    } catch (error) {
      console.error('❌ Error acceptDebt:', error);
      throw error;
    }
  };

  // ==================== UTILIDADES ====================

  const getSplitsFromCache = (userId: number): TransactionSplit[] | null => {
    return splitsByUser.value.get(userId) ?? null;
  };

  const clearCache = (userId?: number) => {
    if (userId) {
      splitsByUser.value.delete(userId);
    } else {
      splitsByUser.value.clear();
    }
  };

  const refreshSplits = async (userId: number): Promise<TransactionSplit[]> => {
    splitsByUser.value.delete(userId);
    return await fetchUserSplits(userId);
  };

  // ==================== RETURN ====================

  return {
    // Estado
    splitsByUser,

    // Métodos principales
    fetchAccountSplits,
    fetchUserSplits,
    getSplitsByTransactionId,
    acceptDebt,

    // Utilidades
    getSplitsFromCache,
    clearCache,
    refreshSplits
  };
});