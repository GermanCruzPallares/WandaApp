import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Objective } from '@/types/models'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api'

export const useObjectiveStore = defineStore('objective', () => {

  // ==================== ESTADO ====================

  const objectivesByAccount = ref<Map<number, Objective[]>>(new Map());

  // ==================== HELPERS ====================

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('wanda_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const handleUnauthorized = () => {
    localStorage.removeItem('wanda_auth_token');
    localStorage.removeItem('wanda_user_id');
    window.location.href = '/login';
  };

  // ==================== API CALLS ====================

  /**
   * GET /api/accounts/{accountId}/objectives
   */
  const fetchObjectives = async (accountId: number): Promise<Objective[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/objectives`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (response.status === 401) { handleUnauthorized(); return []; }
      if (response.status === 404) { objectivesByAccount.value.set(accountId, []); return []; }
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const objectives = await response.json();
      objectivesByAccount.value.set(accountId, objectives);
      return objectives;

      // Guardar en caché
      objectivesByAccount.value.set(accountId, objectives)

      return objectives
    } catch (error) {
      console.error('Error fetchObjectives:', error);
      return [];
    }
  }

  /**
   * GET /api/objectives/{objectiveId}
   */
  const fetchObjectiveById = async (objectiveId: number): Promise<Objective | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) return null;

      return await response.json();

      return objective
    } catch (error) {
      console.error('Error fetchObjectiveById:', error);
      return null;
    }
  }

  /**
   * POST /api/accounts/{accountId}/objectives
   */
  const createObjective = async (
    accountId: number,
    objectiveData: {
      name: string
      target_amount: number
      deadline: Date | string
      objective_picture_url?: string
    },
  ): Promise<Objective | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/objectives`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(objectiveData),
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('Cuenta no encontrada');
        throw new Error(`Error ${response.status}`);
      }

      const newObjective = await response.json();
      objectivesByAccount.value.delete(accountId);
      await fetchObjectives(accountId);
      return newObjective;

      return newObjective
    } catch (error) {
      console.error('Error createObjective:', error);
      throw error;
    }
  }

  /**
   * PUT /api/{objectiveId}
   */
  const updateObjective = async (
    objectiveId: number,
    updates: {
      name?: string
      target_amount?: number
      current_save?: number
      deadline?: Date | string
      objective_picture_url?: string
    },
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${objectiveId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('Objetivo no encontrado');
        if (response.status === 400) {
          const errorText = await response.text()
          throw new Error(errorText || 'Datos inválidos')
        }
        throw new Error(`Error ${response.status}`);
      }

      objectivesByAccount.value.clear();
      return true;

      return true
    } catch (error) {
      console.error('Error updateObjective:', error);
      throw error;
    }
  }

  /**
   * DELETE /api/objectives/{objectiveId}
   */
  const deleteObjective = async (objectiveId: number, accountId?: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('Objetivo no encontrado');
        if (response.status === 400) throw new Error('ID no válido');
        throw new Error(`Error ${response.status}`);
      }

      if (accountId) {
        objectivesByAccount.value.delete(accountId);
        await fetchObjectives(accountId);
      } else {
        objectivesByAccount.value.clear();
      }

      return true
    } catch (error) {
      console.error('Error deleteObjective:', error);
      throw error;
    }
  }

  // ==================== UTILIDADES ====================

  const getObjectivesFromCache = (accountId: number): Objective[] | null => {
    return objectivesByAccount.value.get(accountId) ?? null;
  };

  const clearCache = (accountId?: number) => {
    if (accountId) {
      objectivesByAccount.value.delete(accountId)
    } else {
      objectivesByAccount.value.clear()
    }
  }

  const refreshObjectives = async (accountId: number): Promise<Objective[]> => {
    objectivesByAccount.value.delete(accountId)
    return await fetchObjectives(accountId)
  }

  // ==================== RETURN ====================

  return {
    objectivesByAccount,
    fetchObjectives,
    fetchObjectiveById,
    createObjective,
    updateObjective,
    deleteObjective,
    getObjectivesFromCache,
    clearCache,
    refreshObjectives,
  }
})
