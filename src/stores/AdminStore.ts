// src/stores/AdminStore.ts

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { apiService, type SystemStats } from '@/services/apiService';
import { authService } from '@/services/authService';

export const useAdminStore = defineStore('admin', () => {
  
  // ==================== STATE ====================
  
  const systemStats = ref<SystemStats | null>(null);
  const isLoadingStats = ref(false);
  const statsError = ref<string | null>(null);

  // ==================== COMPUTED ====================
  
  const isAdmin = computed(() => authService.isAdmin());
  
  const hasStats = computed(() => systemStats.value !== null);

  // ==================== ACTIONS ====================

  const fetchSystemStats = async (): Promise<void> => {
    if (!authService.isAdmin()) {
      statsError.value = 'No tienes permisos para ver estas estadísticas';
      return;
    }

    try {
      isLoadingStats.value = true;
      statsError.value = null;
      systemStats.value = await apiService.getSystemStats();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      statsError.value = error instanceof Error ? error.message : 'Error desconocido';
      throw error;
    } finally {
      isLoadingStats.value = false;
    }
  };

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
    fetchSystemStats,
    clearStats
  };
});