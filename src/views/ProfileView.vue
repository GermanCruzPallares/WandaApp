<script setup lang="ts">

import { useUserStore } from '@/stores/UserStore';
import { ref, computed, onMounted } from 'vue';
import TopNav from '@/components/Navs/TopNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import type { Account, AccountUI, User } from '@/types/models';
import BottomNav from '@/components/Navs/BottomNav.vue';
import { useRouter } from 'vue-router';
import AccountsComponent from '@/components/Profile/AccountsComponent.vue';

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
  console.log('🔍 EditAccountView: activeAccount =', active); 
  return active;
});

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo a login...');
    router.push('/login');
    return;
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      router.push('/login');
    }
  }
});

const activeMenuItem = ref('inicio');

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
        <AccountsComponent></AccountsComponent>
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
    padding-top: 40px;
    padding-left: 20px;
    padding-right: 20px;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>