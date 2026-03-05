<template>
  <div class="app-shell">

    <!-- Mobile top nav -->
    <header class="top-nav mobile-only">
      <button class="nav-btn" @click="handleBack" aria-label="Volver">
        <IconArrow class="icon-back" />
      </button>
      <h1 class="nav-title">Notificaciones</h1>
      <div style="width: 40px"></div>
    </header>

    <div class="notifications-layout">
      <AsideNav
        :active-item="activeMenuItem"
        :account-id="activeAccount?.account_id"
        @navigate="handleNavigate"
      />

      <main class="notifications-content">
        <DebtNotificationsComponent
          v-if="userId"
          :user-id="userId"
        />
        <div v-else class="loading-container">
          <p>Cargando datos del usuario...</p>
        </div>
      </main>
    </div>

    <BottomNav class="mobile-only" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import AsideNav from '@/components/Navs/AsideNav.vue';
import BottomNav from '@/components/Navs/BottomNav.vue';
import DebtNotificationsComponent from '@/components/Notifications/DebtNotificationsComponent.vue';
import IconArrow from '@/components/icons/IconArrow.vue';
import type { AccountUI } from '@/types/models';

const router = useRouter();
const userStore = useUserStore();

const activeMenuItem = ref('notificaciones');

const userId = computed(() => userStore.userId);

const accounts = computed<AccountUI[]>(() =>
  userStore.accounts.map(account => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId
  }))
);

const activeAccount = computed(() => accounts.value.find(acc => acc.isActive));

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home')
  }
};

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  if (itemId === 'inicio') router.push('/home');
};

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch (error) {
      console.error('Error cargando datos:', error);
      router.push('/login');
    }
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100svh;
  min-height: 100svh;
  width: 100%;
  overflow: hidden;

  @supports not (height: 100svh) {
    height: 100vh;
    min-height: 100vh;
  }
}

// ─── Mobile top nav ───────────────────────────────────────────────────────────
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  min-height: calc(85px + env(safe-area-inset-top));
  padding: calc(16px + env(safe-area-inset-top)) 20px 16px 20px;
  background: #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  flex-shrink: 0;
  box-sizing: border-box;
}

.nav-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
  text-align: center;
  margin: 0;
}

.nav-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #333;
  transition: background 0.2s;
  min-width: 40px;

  &:hover { background: rgba(0,0,0,0.06); }
}

.icon-back {
  width: 22px;
  height: 22px;
  transform: rotate(90deg);
}

// ─── Layout ───────────────────────────────────────────────────────────────────
.notifications-layout {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    margin-left: 240px;
    height: 100vh;
    overflow: hidden;
  }
}

// ─── Content ─────────────────────────────────────────────────────────────────
.notifications-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px $section-margin-horizontal 80px;

  @media (min-width: 768px) {
    padding: 40px 32px;
  }
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: $color-text-gray;
}

// ─── Visibility helpers ───────────────────────────────────────────────────────
.mobile-only {
  @media (min-width: 768px) { display: none; }
}
</style>