import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Objective } from '@/types/models'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api'

export const useObjectiveStore = defineStore('objective', () => {

  // ── Estado ──────────────────────────────────────────────────────────────
  // Objetivos activos (no archivados) por accountId
  const objectivesByAccount = ref<Map<number, Objective[]>>(new Map());
  // Objetivos archivados por accountId
  const archivedByAccount = ref<Map<number, Objective[]>>(new Map());

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('wanda_auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('wanda_auth_token')
    localStorage.removeItem('wanda_user_id')
    window.location.href = '/login'
  }

  // ── fetchObjectives ──────────────────────────────────────────────────────
  /**
   * GET /api/accounts/{accountId}/objectives
   *
   * Soporta los query params del backend: isCompleted, isArchived
   *
   * Uso:
   *   fetchObjectives(1)                        → activos (sin filtro)
   *   fetchObjectives(1, { isArchived: true })  → archivados
   *   fetchObjectives(1, { isCompleted: true }) → completados y no archivados
   */
  const fetchObjectives = async (
    accountId: number,
    filters: { isCompleted?: boolean; isArchived?: boolean } = {}
  ): Promise<Objective[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.isCompleted !== undefined)
        params.append('isCompleted', String(filters.isCompleted));
      if (filters.isArchived !== undefined)
        params.append('isArchived', String(filters.isArchived));

      const query = params.toString();
      const url = `${API_BASE_URL}/accounts/${accountId}/objectives${query ? `?${query}` : ''}`;

      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });

      if (response.status === 401) { handleUnauthorized(); return []; }

      if (response.status === 404) {
        // Sin resultados: cachear array vacío
        if (filters.isArchived === true) archivedByAccount.value.set(accountId, []);
        else objectivesByAccount.value.set(accountId, []);
        return [];
      }

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const objectives: Objective[] = await response.json();

      // Guardar en la caché adecuada según los filtros
      if (filters.isArchived === true) archivedByAccount.value.set(accountId, objectives);
      else objectivesByAccount.value.set(accountId, objectives);

      return objectives;
    } catch (error) {
      console.error('fetchObjectives error:', error);
      return [];
    }
  };

  /** Shortcut: carga solo los objetivos archivados */
  const fetchArchivedObjectives = (accountId: number): Promise<Objective[]> =>
    fetchObjectives(accountId, { isArchived: true });

  // ── archiveObjective ─────────────────────────────────────────────────────
  /**
   * PATCH /api/objectives/{objectiveId}/archive
   *
   * Marca el objetivo como archivado en el backend.
   * Después invalida la caché de activos y archivados para ese accountId,
   * de forma que el siguiente fetchObjectives traiga datos frescos.
   */
  const archiveObjective = async (
    objectiveId: number,
    accountId: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/objectives/${objectiveId}/archive`,
        { method: 'PATCH', headers: getAuthHeaders() }
      );

      if (response.status === 401) { handleUnauthorized(); return false; }

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || `Error ${response.status}`);
      }

      // Invalidar caché → el próximo fetch será fresco
      objectivesByAccount.value.delete(accountId);
      archivedByAccount.value.delete(accountId);
      return true;
    } catch (error) {
      console.error('archiveObjective error:', error);
      throw error;
    }
  };

  // ── CRUD existente (sin cambios) ─────────────────────────────────────────
  const fetchObjectiveById = async (objectiveId: number): Promise<Objective | null> => {
    try {
      const r = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'GET', headers: getAuthHeaders(),
      });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  };

  const createObjective = async (
    accountId: number,
    data: {
      name: string;
      target_amount: number;
      deadline: Date | string;
      objective_picture_url?: string;
    }
  ): Promise<Objective | null> => {
    try {
      const r = await fetch(`${API_BASE_URL}/accounts/${accountId}/objectives`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(`Error ${r.status}`);
      const obj = await r.json();
      objectivesByAccount.value.delete(accountId);
      await fetchObjectives(accountId);
      return obj;
    } catch (error) { throw error; }
  };

  const updateObjective = async (
    objectiveId: number,
    updates: {
      name?: string;
      target_amount?: number;
      current_save?: number;
      deadline?: Date | string;
    }
  ): Promise<boolean> => {
    try {
      const r = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!r.ok) throw new Error(`Error ${r.status}`);
      objectivesByAccount.value.clear();
      return true;
    } catch (error) { throw error; }
  };

  const deleteObjective = async (
    objectiveId: number,
    accountId?: number
  ): Promise<boolean> => {
    try {
      const r = await fetch(`${API_BASE_URL}/objectives/${objectiveId}`, {
        method: 'DELETE', headers: getAuthHeaders(),
      });
      if (!r.ok) throw new Error(`Error ${r.status}`);
      if (accountId) {
        objectivesByAccount.value.delete(accountId);
        archivedByAccount.value.delete(accountId);
        await fetchObjectives(accountId);
      } else {
        objectivesByAccount.value.clear();
        archivedByAccount.value.clear();
      }
      return true;
    } catch (error) { throw error; }
  };

  // ── Caché helpers ────────────────────────────────────────────────────────
  const getObjectivesFromCache = (accountId: number): Objective[] | null =>
    objectivesByAccount.value.get(accountId) ?? null;

  const getArchivedFromCache = (accountId: number): Objective[] | null =>
    archivedByAccount.value.get(accountId) ?? null;

  const clearCache = (accountId?: number) => {
    if (accountId) {
      objectivesByAccount.value.delete(accountId);
      archivedByAccount.value.delete(accountId);
    } else {
      objectivesByAccount.value.clear();
      archivedByAccount.value.clear();
    }
  }

  const refreshObjectives = (accountId: number): Promise<Objective[]> => {
    objectivesByAccount.value.delete(accountId);
    return fetchObjectives(accountId);
  };

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    objectivesByAccount,
    archivedByAccount,
    fetchObjectives,
    fetchArchivedObjectives,
    fetchObjectiveById,
    createObjective,
    updateObjective,
    deleteObjective,
    archiveObjective,
    getObjectivesFromCache,
    getArchivedFromCache,
    clearCache,
    refreshObjectives,
  };
});