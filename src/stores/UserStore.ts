import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Account, User } from '@/types/models';
import { authService } from '@/services/authService';
import { useAccountStore } from '@/stores/AccountStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useUserStore = defineStore('user', () => {

  const currentUser = ref<User | null>(null);
  const accounts = ref<Account[]>([]);
  const activeAccountId = ref<number>(0);
  const isLoadingUser = ref(false);
  const isLoadingAccounts = ref(false);

  // ==================== COMPUTED ====================

  const isAuthenticated = computed(() => authService.isAuthenticated());
  const token = computed(() => authService.getToken());
  const userId = computed(() => authService.getUserId());

  const activeAccount = computed(() => {
    if (activeAccountId.value === 0) return null;
    return accounts.value.find(acc => acc.account_id === activeAccountId.value) || null;
  });

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
   * GET /api/User/{userId}
   */
  const fetchUser = async (userId: number): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (response.status === 401) { handleUnauthorized(); return null; }
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetchUser:', error);
      return null;
    }
  };

  /**
   * GET /api/User/{userId}/accounts
   */
  const fetchUserAccounts = async (userId: number): Promise<Account[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/${userId}/accounts`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (response.status === 401) { handleUnauthorized(); return []; }
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetchUserAccounts:', error);
      return [];
    }
  };

  /**
   * GET /api/User?email={email}
   */
  const fetchUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/User?email=${encodeURIComponent(email)}`,
        { method: 'GET', headers: getAuthHeaders() }
      );
      if (response.status === 401) { handleUnauthorized(); return null; }
      if (!response.ok) return null;
      const users = await response.json();
      return Array.isArray(users) && users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetchUserByEmail:', error);
      return null;
    }
  };

  // ==================== ACTIONS ====================

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userId = await authService.login({ email, password });
      if (authService.isAdmin()) {
        isLoadingUser.value = true;
        currentUser.value = await fetchUser(userId);
        isLoadingUser.value = false;
        return true;
      }
      await loadUserData(userId);
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
  }): Promise<boolean> => {
    try {
      const userId = await authService.register(userData);
      await loadUserData(userId);
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  const logout = () => {
    authService.logout();
    currentUser.value = null;
    accounts.value = [];
    activeAccountId.value = 0;
    localStorage.removeItem('active_account_id');
  };

  const loadUserData = async (userId: number, forceReload: boolean = false) => {
    try {
      isLoadingUser.value = true
      isLoadingAccounts.value = true

      currentUser.value = await fetchUser(userId);
      accounts.value = await fetchUserAccounts(userId);

      const savedAccountId = localStorage.getItem('active_account_id');

      if (savedAccountId && !forceReload) {
        const accountId = parseInt(savedAccountId, 10);
        if (accounts.value.some(acc => acc.account_id === accountId)) {
          activeAccountId.value = accountId;
          return;
        }
      }

      if (accounts.value.length > 0) {
        const firstAccount = accounts.value[0]
        if (firstAccount) {
          activeAccountId.value = firstAccount.account_id;
          localStorage.setItem('active_account_id', activeAccountId.value.toString());
        }
      } else {
        throw new Error('Usuario sin cuentas asociadas');
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      throw error;
    } finally {
      isLoadingUser.value = false
      isLoadingAccounts.value = false
    }
  }

  const setActiveAccount = (accountId: number) => {
    const account = accounts.value.find(acc => acc.account_id === accountId);
    if (account) {
      activeAccountId.value = accountId;
      localStorage.setItem('active_account_id', accountId.toString());
    } else {
      console.error('Cuenta no encontrada:', accountId);
    }
  }

  /** Delega en AccountStore */
  const getAccountUsers = async (accountId: number): Promise<User[]> => {
    return useAccountStore().fetchAccountMembers(accountId);
  };

  /** Delega en AccountStore */
  const checkUserExists = async (email: string): Promise<User | null> => {
    return fetchUserByEmail(email);
  };

  /** Delega en AccountStore y sincroniza el array local */
  const updateAccount = async (accountId: number, data: Partial<Account>): Promise<void> => {
    try {
      await useAccountStore().updateAccount(accountId, data);
      const index = accounts.value.findIndex(acc => acc.account_id === accountId);
      if (index !== -1) {
        const current = accounts.value[index];
        if (current) accounts.value[index] = { ...current, ...data };
      }
    } catch (error) {
      console.error('Error actualizando cuenta:', error);
      throw error;
    }
  };

  const refreshAccounts = async (setNewestAsActive: boolean = false) => {
    if (!userId.value) return;
    try {
      isLoadingAccounts.value = true;
      const previousAccountId = activeAccountId.value;
      accounts.value = await fetchUserAccounts(userId.value);

      if (setNewestAsActive && accounts.value.length > 0) {
        const newestAccount = accounts.value[accounts.value.length - 1];
        if (newestAccount) { setActiveAccount(newestAccount.account_id); return; }
      }

      if (!accounts.value.some(acc => acc.account_id === previousAccountId)) {
        const firstAccount = accounts.value[0];
        if (firstAccount) setActiveAccount(firstAccount.account_id);
      }
    } catch (error) {
      console.error('Error refrescando cuentas:', error);
    } finally {
      isLoadingAccounts.value = false
    }
  }

  const initialize = async () => {
    const userId = authService.getUserId();
    if (userId && authService.isAuthenticated()) {
      try {
        if (authService.isAdmin()) {
          isLoadingUser.value = true;
          currentUser.value = await fetchUser(userId);
          isLoadingUser.value = false;
        } else {
          await loadUserData(userId, false);
        }
      } catch (error) {
        console.error('Error restaurando sesión:', error);
        logout();
      }
    }
  }

  // ==================== RETURN ====================

  return {
    currentUser,
    accounts,
    activeAccountId,
    isLoadingUser,
    isLoadingAccounts,
    isAuthenticated,
    token,
    userId,
    activeAccount,
    login,
    register,
    logout,
    loadUserData,
    setActiveAccount,
    getAccountUsers,
    checkUserExists,
    refreshAccounts,
    initialize,
    fetchUser,
    fetchUserAccounts,
  };
});