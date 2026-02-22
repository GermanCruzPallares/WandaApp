// src/stores/AccountStore.ts

import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService';
import type { Account, User } from '@/types/models';

export const useAccountStore = defineStore('account', () => {
  // ==================== ESTADO ====================
  
  /**
   * Caché de cuentas para evitar llamadas repetidas al backend
   */
  const accountCache = ref<Map<number, Account>>(new Map());
  
  /**
   * Estado de carga al crear cuenta
   */
  const isCreatingAccount = ref(false);

  // ==================== ACTIONS ====================

  /**
   * GET /api/Account/{accountId}
   * Obtener una cuenta específica por ID (con caché)
   */
const fetchAccount = async (accountId: number): Promise<Account | null> => {
  try {
    const account = await apiService.getAccount(accountId);
    return account;
  } catch (error) {
    console.error('❌ Error al cargar cuenta:', error);
    return null;
  }
};

  /**
   * GET /api/Account/{accountId}/users
   * Obtener los miembros de una cuenta conjunta
   */
  const fetchAccountMembers = async (accountId: number): Promise<User[]> => {
    try {
      console.log(`📡 Cargando miembros de la cuenta ${accountId}`);
      
      const members = await apiService.getAccountMembers(accountId);
      
      console.log('✅ Miembros cargados:', members.length);
      return members;
      
    } catch (error) {
      console.error('❌ Error al cargar miembros de la cuenta:', error);
      return [];
    }
  };

  /**
   * POST /api/Account
   * Crear una cuenta conjunta
   */
// src/stores/AccountStore.ts

const createJointAccount = async (data: {
  name: string;
  userIds: number[]; // ✅ Mantener userIds en el store (más semántico)
}): Promise<void> => {
  isCreatingAccount.value = true;
  
  try {
    console.log('➕ Creando cuenta conjunta:', data.name);
    console.log('🔢 User IDs:', data.userIds);
    
    // ✅ Llamar al backend con member_Ids (como espera el backend)
    await apiService.createJointAccount({
      name: data.name,
      member_Ids: data.userIds // ✅ Mapear userIds → member_Ids
    });
    
    console.log('✅ Cuenta conjunta creada exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando cuenta conjunta:', error);
    throw error;
  } finally {
    isCreatingAccount.value = false;
  }
};

  /**
   * PUT /api/Account/{accountId}
   * Actualizar una cuenta existente
   */
  const updateAccount = async (
    accountId: number, 
    data: {
      name?: string;
      weekly_budget?: number;
      monthly_budget?: number;
      account_picture_url?: string;
    }
  ): Promise<void> => {
    try {
      console.log('📡 Actualizando cuenta:', accountId, data);
      
      await apiService.updateAccount(accountId, data);
      
      // Actualizar caché
      const cached = accountCache.value.get(accountId);
      if (cached) {
        accountCache.value.set(accountId, { ...cached, ...data });
        console.log('✅ Caché actualizado');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando cuenta:', error);
      throw error;
    }
  };


  // ==================== RETURN ====================
  
  return {
    // Estado
    accountCache,
    isCreatingAccount,
    
    // Actions principales
    fetchAccount,
    fetchAccountMembers,
    createJointAccount,
    updateAccount,
    
  };
});