import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Account, User } from '@/types/models';
import { authService } from '@/services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useAccountStore = defineStore('account', () => {

  const accountCache = ref<Map<number, Account>>(new Map());
  const isCreatingAccount = ref(false);

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

  const fetchAccount = async (accountId: number): Promise<Account | null> => {
    try {
      headers: authService.getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'GET', headers: getAuthHeaders()
      });
      if (response.status === 401) { authService.logout(); return null; }
      if (!response.ok) return null;
      const account: Account = await response.json();
      accountCache.value.set(accountId, account);
      return account;
    } catch (error) {
      console.error('Error fetchAccount:', error);
      return null;
    }
  };

  const fetchAccountMembers = async (accountId: number): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Account/${accountId}/users`, {
        method: 'GET', headers: getAuthHeaders()
      });
      if (response.status === 401) { handleUnauthorized(); return []; }
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetchAccountMembers:', error);
      return [];
    }
  };

  const createJointAccount = async (data: { name: string; userIds: number[] }): Promise<void> => {
    isCreatingAccount.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/Account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: data.name, member_Ids: data.userIds })
      });
      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `Error ${response.status}`);
      }
    } catch (error) {
      console.error('Error createJointAccount:', error);
      throw error;
    } finally {
      isCreatingAccount.value = false;
    }
  };

  /**
   * Hace GET previo para mergear campos no enviados con los actuales,
   * evitando sobreescribir datos que no se quieren cambiar.
   */
  const updateAccount = async (
    accountId: number,
    data: { name?: string; amount?: number;weekly_budget?: number; monthly_budget?: number; account_picture_url?: string; }
  ): Promise<void> => {
    try {
      const current = accountCache.value.get(accountId) ?? await fetchAccount(accountId);
      if (!current) throw new Error('Cuenta no encontrada');

      const payload = {
        name: data.name ?? current.name,
        amount: data.amount ?? current.amount,
        weekly_budget: data.weekly_budget ?? current.weekly_budget,
        monthly_budget: data.monthly_budget ?? current.monthly_budget,
        account_picture_url: data.account_picture_url ?? current.account_picture_url ?? '',
      };

      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload)
      });
      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      accountCache.value.set(accountId, { ...current, ...data });
    } catch (error) {
      console.error('Error updateAccount:', error);
      throw error;
    }
  };

  return {
    accountCache,
    isCreatingAccount,
    fetchAccount,
    fetchAccountMembers,
    createJointAccount,
    updateAccount,
  };
});
