import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Account, User } from '@/types/models';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';

export const useUserStore = defineStore('user', () => {
  // ==================== ESTADO ====================

  // Usuario actual
  const currentUser = ref<User | null>(null);

  // Cuentas del usuario actual
  const accounts = ref<Account[]>([]);

  // ID de la cuenta activa (0 = no inicializado)
  const activeAccountId = ref<number>(0);

  // Estados de carga
  const isLoadingUser = ref(false);
  const isLoadingAccounts = ref(false);

  // ==================== COMPUTED ====================

  // Usuario autenticado?
  const isAuthenticated = computed(() => authService.isAuthenticated());

  // Token actual
  const token = computed(() => authService.getToken());

  // User ID actual
  const userId = computed(() => authService.getUserId());

  // Cuenta activa (objeto completo)
  const activeAccount = computed(() => {
    if (activeAccountId.value === 0) return null;
    return accounts.value.find(acc => acc.account_id === activeAccountId.value) || null;
  });

  // ==================== ACTIONS ====================

  /**
   * Login del usuario
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userId = await authService.login({ email, password });

      // Cargar datos del usuario después del login
      await loadUserData(userId);

      return true;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  /**
   * Registro de nuevo usuario
   */
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      const userId = await authService.register(userData);

      // Cargar datos del usuario después del registro
      await loadUserData(userId);

      return true;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  /**
   * Logout del usuario
   */
  const logout = () => {
    authService.logout();

    // Limpiar estado
    currentUser.value = null;
    accounts.value = [];
    activeAccountId.value = 0; // ✅ Resetear a 0
  };

  /**
   * Cargar datos completos del usuario (usuario + cuentas)
   */
  const loadUserData = async (userId: number) => {
    try {
      isLoadingUser.value = true;
      isLoadingAccounts.value = true;

      // Cargar usuario
      currentUser.value = await apiService.getUser(userId);
      // Cargar cuentas
      accounts.value = await apiService.getUserAccounts(userId);

      // ✅ Establecer primera cuenta como activa SIEMPRE
      if (accounts.value.length > 0) {
        const firstAccount = accounts.value[0];
        if (firstAccount) {
          activeAccountId.value = firstAccount.account_id;

          // Persistir en localStorage
          localStorage.setItem('active_account_id', activeAccountId.value.toString());
        }
      } else {
        // ❌ ERROR: Usuario autenticado sin cuentas
        console.error('❌ Usuario sin cuentas - esto no debería ocurrir');
        throw new Error('Usuario sin cuentas asociadas');
      }

    } catch (error) {
      console.error('❌ Error cargando datos del usuario:', error);
      throw error;
    } finally {
      isLoadingUser.value = false;
      isLoadingAccounts.value = false;
    }
  };

  /**
   * Cambiar cuenta activa
   */
  const setActiveAccount = (accountId: number) => {
    const account = accounts.value.find(acc => acc.account_id === accountId);

    if (account) {
      activeAccountId.value = accountId;
      console.log('✅ Cuenta activa cambiada a:', account.name);

      // Persistir en localStorage
      localStorage.setItem('active_account_id', accountId.toString());
    } else {
      console.error('❌ Cuenta no encontrada:', accountId);
    }
  };

  /**
   * Obtener usuarios de una cuenta (para cuentas conjuntas)
   */
  const getAccountUsers = async (accountId: number): Promise<User[]> => {
    try {
      return await apiService.getAccountMembers(accountId);
    } catch (error) {
      console.error('❌ Error obteniendo usuarios de la cuenta:', error);
      return [];
    }
  };

  /**
   * Verificar si un usuario existe por email
   */
  const checkUserExists = async (email: string): Promise<User | null> => {
    try {
      console.log('🔍 Verificando si existe el usuario:', email);
      const user = await apiService.getUserByEmail(email);

      if (user) {
        console.log('✅ Usuario encontrado:', user.name);
      } else {
        console.log('❌ Usuario no encontrado');
      }

      return user;
    } catch (error) {
      console.error('❌ Error verificando usuario:', error);
      return null;
    }
  };

  /**
   * Actualizar cuenta
   */
  const updateAccount = async (accountId: number, data: Partial<Account>): Promise<void> => {
    try {
      await apiService.updateAccount(accountId, data);

      // Actualizar en el estado local
      const index = accounts.value.findIndex(acc => acc.account_id === accountId);
      if (index !== -1) {
        const currentAccount = accounts.value[index];
        if (currentAccount) {
          accounts.value[index] = { ...currentAccount, ...data };
          console.log('✅ Cuenta actualizada localmente');
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando cuenta:', error);
      throw error;
    }
  };

  /**
   * Refrescar cuentas (útil después de cambios)
   */
  const refreshAccounts = async () => {
    if (!userId.value) return;

    try {
      isLoadingAccounts.value = true;
      accounts.value = await apiService.getUserAccounts(userId.value);
      console.log('✅ Cuentas refrescadas');

      // ✅ Verificar que la cuenta activa sigue existiendo
      if (!accounts.value.some(acc => acc.account_id === activeAccountId.value)) {
        // Si la cuenta activa fue eliminada, seleccionar la primera
        const firstAccount = accounts.value[0];
        if (firstAccount) {
          activeAccountId.value = firstAccount.account_id;
          localStorage.setItem('active_account_id', activeAccountId.value.toString());
          console.log('⚠️ Cuenta activa corregida a:', activeAccountId.value);
        }
      }
    } catch (error) {
      console.error('❌ Error refrescando cuentas:', error);
    } finally {
      isLoadingAccounts.value = false;
    }
  };

  /**
   * Inicializar store (restaurar sesión si existe)
   */
  const initialize = async () => {
    const userId = authService.getUserId();

    if (userId && authService.isAuthenticated()) {
      console.log('🔄 Restaurando sesión del usuario:', userId);

      try {
        await loadUserData(userId);

        // ✅ Restaurar cuenta activa desde localStorage
        const savedAccountId = localStorage.getItem('active_account_id');
        if (savedAccountId) {
          const accountId = parseInt(savedAccountId, 10);
          if (accounts.value.some(acc => acc.account_id === accountId)) {
            activeAccountId.value = accountId;
            console.log('✅ Cuenta activa restaurada:', activeAccountId.value);
          }
        }

        // ✅ Verificación: Si no hay cuenta activa válida, usar la primera
        if (!accounts.value.some(acc => acc.account_id === activeAccountId.value)) {
          const firstAccount = accounts.value[0];
          if (firstAccount) {
            activeAccountId.value = firstAccount.account_id;
            localStorage.setItem('active_account_id', activeAccountId.value.toString());
            console.log('⚠️ Cuenta activa corregida a la primera:', activeAccountId.value);
          }
        }

      } catch (error) {
        console.error('❌ Error restaurando sesión:', error);
        logout();
      }
    }
  };

  // ==================== RETURN ====================

  return {
    // Estado
    currentUser,
    accounts,
    activeAccountId,
    isLoadingUser,
    isLoadingAccounts,

    // Computed
    isAuthenticated,
    token,
    userId,
    activeAccount,

    // Actions
    login,
    register,
    logout,
    loadUserData,
    setActiveAccount,
    getAccountUsers,
    checkUserExists,
    updateAccount,
    refreshAccounts,
    initialize
  };
});