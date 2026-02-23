<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import BottomNav from '@/components/Navs/BottomNav.vue';
import TopNav from '@/components/Navs/TopNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import AccountsComponent from '@/components/Profile/AccountsComponent.vue';
import BudgetComponent from '@/components/Profile/BudgetComponent.vue';
import ObjContribution from '@/components/Profile/ObjContribution.vue';
import RecurringTransactionComponent from '@/components/Profile/RecurringTransactionComponent.vue';
import type { AccountUI } from '@/types/models';


const router = useRouter();
const userStore = useUserStore();

// ==================== COMPUTED ====================

// Usuario actual desde el store
const currentUser = computed(() => userStore.currentUser);

// Cuentas con formato AccountUI (agregando isActive)
const accounts = computed<AccountUI[]>(() => {
  return userStore.accounts.map(account => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId
  }));
});

// Cuenta activa
const activeAccount = computed(() => {
  const active = accounts.value.find(acc => acc.isActive);
  console.log('🔍 ProfileView: activeAccount =', active); 
  return active;
});

// ==================== ESTADO LOCAL ====================

const activeMenuItem = ref('perfil');

// ==================== LIFECYCLE ====================

onMounted(async () => {
  // Verificar autenticación
  if (!userStore.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo a login...');
    router.push('/login');
    return;
  }

  // Si el store no tiene datos cargados, cargarlos
  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      router.push('/login');
    }
  }
});

// ==================== HANDLERS ====================

const handleTransactionClick = (transactionId: number) => {
  console.log('Transacción clickeada:', transactionId);
  // Aquí puedes navegar a una vista de detalle si lo necesitas
  // router.push(`/transactions/${transactionId}`);
};

</script>

<template>
  <AsideNav 
    :active-item="activeMenuItem"
    :account-id="activeAccount?.account_id"
  />
  
  <TopNav 
    :account-id="activeAccount?.account_id"
    class="mobile-only"
  />
  
  <main class="profile-content">
    <div class="profile-content__header">
      <AccountsComponent />
    </div>

    <div class="profile-content__grid">
      <div class="profile-content__left">
        <BudgetComponent
          v-if="activeAccount"
          :account-id="activeAccount.account_id"
        />
        
        <ObjContribution
          v-if="activeAccount"
          :account-id="activeAccount.account_id"
        />
      </div>

      <div class="profile-content__right">
        <RecurringTransactionComponent
          v-if="activeAccount"
          :account-id="activeAccount.account_id"
          type="expense"
          @transaction-click="handleTransactionClick"
        />

        <RecurringTransactionComponent
          v-if="activeAccount"
          :account-id="activeAccount.account_id"
          type="income"
          @transaction-click="handleTransactionClick"
        />
      </div>
    </div>
  </main>
  
  <BottomNav class="mobile-only" />

</template>

<style scoped lang="scss">
.profile-content {
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 80px;

  @media (min-width: 768px) {
    margin-left: 240px;
    padding: 40px 20px;
    max-width: calc(100vw - 240px);
  }

  &__header {
    width: 100%;
    margin-bottom: 20px;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (min-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }
  }

  &__left,
  &__right {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>