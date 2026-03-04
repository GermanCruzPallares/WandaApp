import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Account, User } from '@/types/models';
import { authService } from '@/services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useAccountStore = defineStore('account', () => {

  const isCreatingAccount = ref(false);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('wanda_auth_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('wanda_auth_token');
    localStorage.removeItem('wanda_user_id');
    window.location.href = '/login';
  };

  const fetchAccount = async (accountId: number): Promise<Account | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'GET',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
      });
      if (response.status === 401) { authService.logout(); return null; }
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetchAccount:', error);
      return null;
    }
  };

  const fetchAccountMembers = async (accountId: number): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Account/${accountId}/users`, {
        method: 'GET',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
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
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
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

  const updateAccount = async (
    accountId: number,
    data: { name?: string; amount?: number; weekly_budget?: number; monthly_budget?: number; account_picture_url?: string; imageFile?: File | null; }
  ): Promise<Account | null> => {
    try {
      const current = await fetchAccount(accountId);
      if (!current) throw new Error('Cuenta no encontrada');

      const formData = new FormData();
      formData.append('Name', data.name ?? current.name);
      formData.append('Amount', String(data.amount ?? current.amount));
      formData.append('Weekly_budget', String(data.weekly_budget ?? current.weekly_budget));
      formData.append('Monthly_budget', String(data.monthly_budget ?? current.monthly_budget));
      formData.append('Account_picture_url', data.account_picture_url ?? current.account_picture_url ?? '');

      if (data.imageFile) {
        formData.append('ImageFile', data.imageFile);
      }

      const token = localStorage.getItem('wanda_auth_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'PUT',
        headers,
        body: formData
      });

      if (response.status === 401) { handleUnauthorized(); return null; }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      // Devuelve los datos frescos del servidor
      return await fetchAccount(accountId);

    } catch (error) {
      console.error('Error updateAccount:', error);
      throw error;
    }
  };

  return {
    isCreatingAccount,
    fetchAccount,
    fetchAccountMembers,
    createJointAccount,
    updateAccount,
  };
});