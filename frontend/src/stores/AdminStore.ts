import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import type { User } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export interface SystemStats {
  users: {
    total: number;
    admins: number;
    regularUsers: number;
  };
  accounts: {
    total: number;
    personal: number;
    joint: number;
  };
  financials: {
    totalTransactions: number;
    totalSystemBalance: number;
  };
}

export const useAdminStore = defineStore('admin', () => {

  // ==================== ESTADO ====================

  const systemStats = ref<SystemStats | null>(null);
  const isLoadingStats = ref(false);
  const statsError = ref<string | null>(null);
  const isCreatingAdmin = ref(false);
  const createAdminError = ref<string | null>(null);
  const users = ref<User[]>([]);
  const isLoadingUsers = ref(false);
  const usersError = ref<string | null>(null);

  // ==================== COMPUTED ====================

  const isAdmin = computed(() => authService.isAdmin());
  const hasStats = computed(() => systemStats.value !== null);

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

  // ==================== ACTIONS ====================

  /**
   * GET /api/User/stats
   */
  const fetchSystemStats = async (): Promise<void> => {
    if (!authService.isAdmin()) {
      statsError.value = 'No tienes permisos para ver estas estadísticas';
      return;
    }
    try {
      isLoadingStats.value = true;
      statsError.value = null;

      const response = await fetch(`${API_BASE_URL}/User/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `Error ${response.status}`);
      }

      systemStats.value = await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      statsError.value = error instanceof Error ? error.message : 'Error desconocido';
      throw error;
    } finally {
      isLoadingStats.value = false;
    }
  };

  /**
   * POST /api/Auth/admin
   */
  const createAdmin = async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    if (!authService.isAdmin()) {
      createAdminError.value = 'No tienes permisos para crear administradores';
      return false;
    }
    try {
      isCreatingAdmin.value = true;
      createAdminError.value = null;

      const response = await fetch(`${API_BASE_URL}/Auth/admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (response.status === 401) { handleUnauthorized(); return false; }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `Error ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error creando administrador:', error);
      createAdminError.value = error instanceof Error ? error.message : 'Error desconocido';
      return false;
    } finally {
      isCreatingAdmin.value = false;
    }
  };

  /**
   * GET /api/User o GET /api/User?email={email}
   */
  const fetchAllUsers = async (email?: string): Promise<void> => {
    if (!authService.isAdmin()) {
      usersError.value = 'No tienes permisos para ver usuarios';
      return;
    }
    try {
      isLoadingUsers.value = true;
      usersError.value = null;

      const url = email
        ? `${API_BASE_URL}/User?email=${encodeURIComponent(email)}`
        : `${API_BASE_URL}/User`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `Error ${response.status}`);
      }

      users.value = await response.json();
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      usersError.value = error instanceof Error ? error.message : 'Error desconocido';
    } finally {
      isLoadingUsers.value = false;
    }
  };

  const deleteUser = async (userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (response.status === 401) { handleUnauthorized(); return }
    if (!response.ok) throw new Error(`Error ${response.status}`)
  }

  const clearStats = () => {
    systemStats.value = null;
    statsError.value = null;
  };

  // ==================== RETURN ====================

  return {
    systemStats,
    isLoadingStats,
    statsError,
    isAdmin,
    hasStats,
    isCreatingAdmin,
    createAdminError,
    users,
    isLoadingUsers,
    usersError,
    fetchSystemStats,
    clearStats,
    createAdmin,
    fetchAllUsers,
    deleteUser
  };
});