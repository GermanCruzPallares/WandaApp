<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import HeaderNav from '@/components/Navs/HeaderNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import type { AccountUI} from '@/types/models';

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
  console.log('🔍 HomeView: activeAccount =', active); 
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


const handleBack = () => router.push('/home');
const activeMenuItem = ref('inicio');

</script>

<template>
<div class="editAccount-page">
  <AsideNav 
    :active-item="activeMenuItem"
    :account-id="activeAccount?.account_id"
  />
  
    <HeaderNav 
      title="Editar Cuenta" 
      @back="handleBack"
      class="mobile-only"
    />

    <div class="desktop-header">
      <h1 class="page-title">Editar Cuenta</h1>
    </div>
</div>

</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';
.editAccount-page {
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

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>