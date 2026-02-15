import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Objective } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useObjectiveStore = defineStore('objective', () => {
  // ✅ Estado: Map para cachear objetivos por accountId
  const objectivesByAccount = ref<Map<number, Objective[]>>(new Map());

  /**
   * Obtener el token de autenticación
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('wanda_auth_token');
  };

  /**
   * Headers con autenticación
   */
  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  /**
   * GET /api/accounts/{accountId}/objectives
   * Obtener todos los objetivos de una cuenta
   */
  const fetchObjectives = async (accountId: number): Promise<Objective[]> => {
    try {

      
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/objectives`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ No autorizado - redirigiendo a login');
          localStorage.removeItem('wanda_auth_token');
          localStorage.removeItem('wanda_user_id');
          window.location.href = '/login';
          return [];
        }
        
        if (response.status === 404) {
          console.log('ℹ️ No se encontraron objetivos para esta cuenta');
          objectivesByAccount.value.set(accountId, []);
          return [];
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const objectives = await response.json();
      
      // Guardar en caché
      objectivesByAccount.value.set(accountId, objectives);
      
      return objectives;

    } catch (error) {
      console.error('❌ Error al cargar objetivos:', error);
      return [];
    }
  };

  /**
   * GET /api/objectives/{objectiveId}
   * Obtener un objetivo específico por ID
   */
  const fetchObjectiveById = async (objectiveId: number): Promise<Objective | null> => {
    try {

      
      const response = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error('❌ Objetivo no encontrado');
          return null;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const objective = await response.json();

      
      return objective;

    } catch (error) {
      console.error('❌ Error al cargar objetivo:', error);
      return null;
    }
  };

  /**
   * POST /api/accounts/{accountId}/objectives
   * Crear un nuevo objetivo
   */
  const createObjective = async (
    accountId: number, 
    objectiveData: {
      name: string;
      target_amount: number;
      deadline: Date | string;
      objective_picture_url?: string;
    }
  ): Promise<Objective | null> => {
    try {
      console.log(`📡 POST /api/accounts/${accountId}/objectives`);

      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/objectives`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(objectiveData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cuenta no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const newObjective = await response.json();
  
      // Invalidar caché para recargar
      objectivesByAccount.value.delete(accountId);
      
      // Recargar objetivos
      await fetchObjectives(accountId);

      return newObjective;

    } catch (error) {
      console.error('❌ Error al crear objetivo:', error);
      throw error;
    }
  };

  /**
   * PUT /api/{objectiveId}
   * Actualizar un objetivo existente
   */
  const updateObjective = async (
    objectiveId: number, 
    updates: {
      name?: string;
      target_amount?: number;
      current_save?: number;
      deadline?: Date | string;
      objective_picture_url?: string;
    }
  ): Promise<boolean> => {
    try {

      const response = await fetch(`${API_BASE_URL}/${objectiveId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Objetivo no encontrado');
        }
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'Datos inválidos');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Objetivo actualizado');

      // Invalidar caché de todas las cuentas (no sabemos a cuál pertenece)
      objectivesByAccount.value.clear();

      return true;

    } catch (error) {
      console.error('❌ Error al actualizar objetivo:', error);
      throw error;
    }
  };

  /**
   * DELETE /api/objectives/{objectiveId}
   * Eliminar un objetivo
   */
  const deleteObjective = async (objectiveId: number, accountId?: number): Promise<boolean> => {
    try {
      console.log(`📡 DELETE /api/objectives/${objectiveId}`);

      const response = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Objetivo no encontrado');
        }
        if (response.status === 400) {
          throw new Error('ID no válido');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Objetivo eliminado');

      // Invalidar caché
      if (accountId) {
        objectivesByAccount.value.delete(accountId);
        // Recargar objetivos de esa cuenta
        await fetchObjectives(accountId);
      } else {
        // Si no sabemos la cuenta, limpiar todo el caché
        objectivesByAccount.value.clear();
      }

      return true;

    } catch (error) {
      console.error('❌ Error al eliminar objetivo:', error);
      throw error;
    }
  };

  /**
   * Obtener objetivos desde caché (sin llamada al backend)
   */
  const getObjectivesFromCache = (accountId: number): Objective[] | null => {
    if (objectivesByAccount.value.has(accountId)) {
      return objectivesByAccount.value.get(accountId)!;
    }
    return null;
  };

  /**
   * Limpiar caché de una cuenta específica o todo
   */
  const clearCache = (accountId?: number) => {
    if (accountId) {
      objectivesByAccount.value.delete(accountId);
    } else {
      objectivesByAccount.value.clear();
    }
  };

  /**
   * Refrescar objetivos de una cuenta (forzar recarga desde backend)
   */
  const refreshObjectives = async (accountId: number): Promise<Objective[]> => {
    objectivesByAccount.value.delete(accountId);
    return await fetchObjectives(accountId);
  };

  return {
    // Estado
    objectivesByAccount,
    
    // Métodos
    fetchObjectives,
    fetchObjectiveById,
    createObjective,
    updateObjective,
    deleteObjective,
    getObjectivesFromCache,
    clearCache,
    refreshObjectives
  };
});