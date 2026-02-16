<template>
  <div class="objective-contributions-page">
    <AsideNav 
      :active-item="activeMenuItem"
      :account-id="activeAccount?.account_id"
      @navigate="handleNavigate"
    />

    <HeaderNav 
      title="Historial de Aportaciones" 
      @back="handleBack"
      class="mobile-only"
    />

    <div class="desktop-header">
      <h1 class="page-title">Historial de Aportaciones</h1>
    </div>

    <main class="contributions-content">
      <ContributionHistory
        v-if="activeAccount?.account_id"
        :account-id="activeAccount.account_id"
        :objectives="objectives"
        :initial-selected-objective="initialObjectiveId"
        @saving-click="handleSavingClick"
        @transactions-loaded="handleTransactionsLoaded"
      />
      
      <div v-else class="loading-container">
        <p>Cargando datos de la cuenta...</p>
      </div>
    </main>

  
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useObjectiveStore } from '@/stores/ObjectiveStore';
import { useUserStore } from '@/stores/UserStore';
import HeaderNav from '@/components/Navs/HeaderNav.vue';
import BottomNav from '@/components/Navs/BottomNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import ContributionHistory from '@/components/HomeApp/ContributionHistory.vue';
import type { Transaction, Objective, AccountUI } from '@/types/models';

const router = useRouter();
const route = useRoute();
const objectiveStore = useObjectiveStore();
const userStore = useUserStore();

// ==================== PARAMS DE RUTA ====================

const initialObjectiveId = computed(() => {
  const param = route.params.objectiveId;
  const idStr = Array.isArray(param) ? param[0] : param;
  if (!idStr || idStr === 'all') return null;
  const parsed = parseInt(idStr);
  return isNaN(parsed) ? null : parsed;
});

// ==================== ESTADO UI LOCAL ====================

const activeMenuItem = ref('libro');
const objectives = ref<Objective[]>([]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const transactions = ref<Transaction[]>([]);

// ==================== COMPUTED (User Store) ====================

// Cuentas con formato AccountUI
const accounts = computed<AccountUI[]>(() => {
  return userStore.accounts.map(account => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId
  }));
});

// Cuenta activa
const activeAccount = computed(() => {
  return accounts.value.find(acc => acc.isActive);
});

// ==================== ACTIONS ====================

const loadObjectives = async (accountId: number) => {
  try {
    objectives.value = await objectiveStore.fetchObjectives(accountId);
  } catch (error) {
    console.error('Error cargando objetivos:', error);
  }
};

const handleTransactionsLoaded = (loadedTransactions: Transaction[]) => {
  transactions.value = loadedTransactions;
};

// Navegación
const handleBack = () => router.push('/home');

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  if (itemId === 'inicio') router.push('/home');
};

const handleSavingClick = (transactionId: number) => {
  console.log('Aportación clickeada:', transactionId);
};

// ==================== LIFECYCLE ====================

onMounted(async () => {
  // 1. Verificar autenticación
  if (!userStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  // 2. Cargar datos del usuario si es necesario
  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      router.push('/login');
    }
  }

  // 3. Cargar objetivos si ya tenemos cuenta activa
  if (activeAccount.value?.account_id) {
    loadObjectives(activeAccount.value.account_id);
  }
});

// 4. Recargar objetivos cuando cambia la cuenta activa
// (El cambio de cuenta ahora lo gestiona AsideNav modificando el store)
watch(() => activeAccount.value?.account_id, (newAccountId) => {
  if (newAccountId) {
    console.log('🔄 Cambio de cuenta detectado:', newAccountId);
    loadObjectives(newAccountId);
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.objective-contributions-page {
  min-height: 100vh;
  background-color: $background-principal;
}

.desktop-header {
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-left: 240px;
    padding: 32px 32px 0;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: $color-text;
  margin: 0 0 24px 0;
}

.contributions-content {
  padding-top: 80px;
  padding-bottom: 80px;
  min-height: 100vh;

  @media (min-width: 768px) {
    margin-left: 240px;
    padding-top: 20px;
    padding-bottom: 40px;
  }
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: $color-text-gray;
  
  @media (min-width: 768px) {
    margin-left: 240px;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>