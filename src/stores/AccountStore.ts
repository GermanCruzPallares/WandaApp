import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/apiService'
import type { Account, User } from '@/types/models'

export const useAccountStore = defineStore('account', () => {

  // ==================== ESTADO ====================

  const accountCache = ref<Map<number, Account>>(new Map());
  const isCreatingAccount = ref(false);

  // ==================== ACTIONS ====================

  /**
   * GET /api/Account/{accountId}
   */
  const fetchAccount = async (accountId: number): Promise<Account | null> => {
    try {
      return await apiService.getAccount(accountId);
    } catch (error) {
      console.error('Error fetchAccount:', error);
      return null;
    }
  };

  /**
   * GET /api/Account/{accountId}/users
   */
  const fetchAccountMembers = async (accountId: number): Promise<User[]> => {
    try {
      return await apiService.getAccountMembers(accountId);
    } catch (error) {
      console.error('Error fetchAccountMembers:', error);
      return [];
    }
  }

  /**
   * POST /api/Account
   */
  const createJointAccount = async (data: {
    name: string;
    userIds: number[];
  }): Promise<void> => {
    isCreatingAccount.value = true;
    try {
      await apiService.createJointAccount({
        name: data.name,
        member_Ids: data.userIds
      });
    } catch (error) {
      console.error('Error createJointAccount:', error);
      throw error;
    } finally {
      isCreatingAccount.value = false;
    }
  };

  /**
   * PUT /api/Account/{accountId}
   */
  const updateAccount = async (
    accountId: number,
    data: {
      name?: string
      weekly_budget?: number
      monthly_budget?: number
      account_picture_url?: string
    },
  ): Promise<void> => {
    try {
      await apiService.updateAccount(accountId, data);
      const cached = accountCache.value.get(accountId);
      if (cached) {
        accountCache.value.set(accountId, { ...cached, ...data });
      }
    } catch (error) {
      console.error('Error updateAccount:', error);
      throw error;
    }
  };

  // ==================== RETURN ====================

  return {
    accountCache,
    isCreatingAccount,
    fetchAccount,
    fetchAccountMembers,
    createJointAccount,
    updateAccount,
  };
});
