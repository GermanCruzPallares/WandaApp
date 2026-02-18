import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Account, User } from '@/types/models'
import { authService } from '@/services/authService'
import { apiService } from '@/services/apiService'

export const useUserStore = defineStore('user', () => {
  // ==================== ESTADO ====================

  // Usuario actual
  const currentUser = ref<User | null>(null)

  // Cuentas del usuario actual
  const accounts = ref<Account[]>([])

  // ID de la cuenta activa (0 = no inicializado)
  const activeAccountId = ref<number>(0)

  // Estados de carga
  const isLoadingUser = ref(false)
  const isLoadingAccounts = ref(false)

  // ==================== COMPUTED ====================

  // Usuario autenticado?
  const isAuthenticated = computed(() => authService.isAuthenticated())

  // Token actual
  const token = computed(() => authService.getToken())

  // User ID actual
  const userId = computed(() => authService.getUserId())

  // Cuenta activa (objeto completo)
  const activeAccount = computed(() => {
    if (activeAccountId.value === 0) return null
    return accounts.value.find((acc) => acc.account_id === activeAccountId.value) || null
  })

  // ==================== ACTIONS ====================

  /**
   * Login del usuario
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userId = await authService.login({ email, password })

      // Cargar datos del usuario después del login
      await loadUserData(userId)

      return true
    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    }
  }

  /**
   * Registro de nuevo usuario
   */
  const register = async (userData: {
    name: string
    email: string
    password: string
  }): Promise<boolean> => {
    try {
      const userId = await authService.register(userData)

      // Cargar datos del usuario después del registro
      await loadUserData(userId)

      return true
    } catch (error) {
      console.error('❌ Error en registro:', error)
      throw error
    }
  }

  /**
   * Logout del usuario
   */
  const logout = () => {
    authService.logout()

    // Limpiar estado
    currentUser.value = null
    accounts.value = []
    activeAccountId.value = 0

    // ✅ LIMPIAR localStorage
    localStorage.removeItem('active_account_id')
  }

  /**
   * ✅ CORREGIDO: Cargar datos completos del usuario (usuario + cuentas)
   */
  const loadUserData = async (userId: number, forceReload: boolean = false) => {
    try {
      isLoadingUser.value = true
      isLoadingAccounts.value = true

      // Cargar usuario
      currentUser.value = await apiService.getUser(userId)

      // Cargar cuentas
      accounts.value = await apiService.getUserAccounts(userId)

      // ✅ PRIORIDAD: Intentar restaurar la cuenta activa desde localStorage
      const savedAccountId = localStorage.getItem('active_account_id')

      if (savedAccountId && !forceReload) {
        const accountId = parseInt(savedAccountId, 10)

        // Verificar que la cuenta guardada existe
        if (accounts.value.some((acc) => acc.account_id === accountId)) {
          activeAccountId.value = accountId
          console.log('✅ Cuenta activa restaurada desde localStorage:', activeAccountId.value)
          return
        }
      }

      // Si no hay cuenta guardada o no existe, usar la primera
      if (accounts.value.length > 0) {
        const firstAccount = accounts.value[0]
        if (firstAccount) {
          activeAccountId.value = firstAccount.account_id
          localStorage.setItem('active_account_id', activeAccountId.value.toString())
          console.log('✅ Cuenta activa establecida (primera cuenta):', activeAccountId.value)
        }
      } else {
        console.error('❌ Usuario sin cuentas - esto no debería ocurrir')
        throw new Error('Usuario sin cuentas asociadas')
      }
    } catch (error) {
      console.error('❌ Error cargando datos del usuario:', error)
      throw error
    } finally {
      isLoadingUser.value = false
      isLoadingAccounts.value = false
    }
  }

  /**
   * Cambiar cuenta activa
   */
  const setActiveAccount = (accountId: number) => {
    const account = accounts.value.find((acc) => acc.account_id === accountId)

    if (account) {
      activeAccountId.value = accountId
      console.log('✅ Cuenta activa cambiada a:', account.name)

      // ✅ PERSISTIR SIEMPRE en localStorage
      localStorage.setItem('active_account_id', accountId.toString())
    } else {
      console.error('❌ Cuenta no encontrada:', accountId)
    }
  }

  /**
   * Obtener usuarios de una cuenta (para cuentas conjuntas)
   */
  const getAccountUsers = async (accountId: number): Promise<User[]> => {
    try {
      return await apiService.getAccountMembers(accountId)
    } catch (error) {
      console.error('❌ Error obteniendo usuarios de la cuenta:', error)
      return []
    }
  }

  /**
   * Verificar si un usuario existe por email
   */
  const checkUserExists = async (email: string): Promise<User | null> => {
    try {
      console.log('🔍 Verificando si existe el usuario:', email)
      const user = await apiService.getUserByEmail(email)

      if (user) {
        console.log('✅ Usuario encontrado:', user.name)
      } else {
        console.log('❌ Usuario no encontrado')
      }

      return user
    } catch (error) {
      console.error('❌ Error verificando usuario:', error)
      return null
    }
  }

  /**
   * Actualizar cuenta
   */
  const updateAccount = async (accountId: number, data: Partial<Account>): Promise<void> => {
    try {
      await apiService.updateAccount(accountId, data)

      // Actualizar en el estado local
      const index = accounts.value.findIndex((acc) => acc.account_id === accountId)
      if (index !== -1) {
        const currentAccount = accounts.value[index]
        if (currentAccount) {
          accounts.value[index] = { ...currentAccount, ...data }
          console.log('✅ Cuenta actualizada localmente')
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando cuenta:', error)
      throw error
    }
  }

  /**
   * ✅ CORREGIDO: Refrescar cuentas y establecer la nueva cuenta como activa
   */
  const refreshAccounts = async (setNewestAsActive: boolean = false) => {
    if (!userId.value) return

    try {
      isLoadingAccounts.value = true

      const previousAccountId = activeAccountId.value
      accounts.value = await apiService.getUserAccounts(userId.value)

      console.log('✅ Cuentas refrescadas:', accounts.value.length)

      // ✅ Si se solicita, establecer la cuenta más nueva como activa
      if (setNewestAsActive && accounts.value.length > 0) {
        // La última cuenta del array es la más nueva (recién creada)
        const newestAccount = accounts.value[accounts.value.length - 1]
        if (newestAccount) {
          setActiveAccount(newestAccount.account_id)
          console.log('✅ Nueva cuenta establecida como activa:', newestAccount.name)
          return
        }
      }

      // Verificar que la cuenta activa sigue existiendo
      if (!accounts.value.some((acc) => acc.account_id === previousAccountId)) {
        // Si la cuenta activa fue eliminada, seleccionar la primera
        const firstAccount = accounts.value[0]
        if (firstAccount) {
          setActiveAccount(firstAccount.account_id)
          console.log('⚠️ Cuenta activa corregida a:', firstAccount.name)
        }
      }
    } catch (error) {
      console.error('❌ Error refrescando cuentas:', error)
    } finally {
      isLoadingAccounts.value = false
    }
  }

  /**
   * ✅ CORREGIDO: Inicializar store (restaurar sesión si existe)
   */
  const initialize = async () => {
    const userId = authService.getUserId()

    if (userId && authService.isAuthenticated()) {
      console.log('🔄 Restaurando sesión del usuario:', userId)

      try {
        // ✅ Cargar datos sin forzar recarga (respetará localStorage)
        await loadUserData(userId, false)
      } catch (error) {
        console.error('❌ Error restaurando sesión:', error)
        logout()
      }
    }
  }

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
    initialize,
  }
})
