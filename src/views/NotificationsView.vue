<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import DebtNotificationsComponent from '@/components/Notifications/DebtNotificationsComponent.vue';

const router = useRouter();
const userStore = useUserStore();

// ==================== COMPUTED ====================

const activeAccount = computed(() => {
  return userStore.accounts.find(acc => acc.account_id === userStore.activeAccountId) || null;
});

const isPersonal = computed(() => activeAccount.value?.account_type === 'personal');

const userId = computed(() => userStore.userId);

// ==================== LIFECYCLE ====================

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch {
      router.push('/login');
    }
  }
});
</script>

<template>
  <div class="notifications-view">
    <!-- Header -->
    <header class="notifications-header">
      <button class="notifications-header__back" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="notifications-header__title">Notificaciones</h1>
    </header>

    <!-- Contenido -->
    <main class="notifications-content">
      <!-- Cuenta personal → mostrar deudas -->
      <DebtNotificationsComponent
        v-if="isPersonal && userId"
        :user-id="userId"
      />

      <!-- Cuenta conjunta → mensaje informativo -->
      <div v-else class="notifications-info">
        <div class="notifications-info__icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="notifications-info__text">
          Las notificaciones de deudas solo están disponibles desde tu cuenta personal.
        </p>
        <button class="notifications-info__btn" @click="userStore.setActiveAccount(userStore.accounts.find(a => a.account_type === 'personal')?.account_id ?? 0)">
          Ir a cuenta personal
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.notifications-view {
  min-height: 100vh;
  background-color: $background-principal;
}

// ==================== HEADER ====================

.notifications-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background-color: $color-white;

  &__back {
    width: 36px;
    height: 36px;
    border: none;
    background: none;
    cursor: pointer;
    color: $color-text;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color $transition-speed $transition-ease;

    &:hover { background-color: $section-bg-primary; }
    &:active { background-color: $section-bg-secondary; }
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: $color-text;
    margin: 0;
  }
}

// ==================== CONTENIDO ====================

.notifications-content {
  padding: 20px;
}

// ==================== INFO (CUENTA CONJUNTA) ====================

.notifications-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;

  &__icon {
    color: #d0d0d0;
  }

  &__text {
    margin: 0;
    font-size: 14px;
    color: $color-text-gray;
    max-width: 280px;
    line-height: 1.5;
  }

  &__btn {
    margin-top: 4px;
    padding: 10px 24px;
    background-color: $color-text--dk;
    color: $color-white;
    border: none;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity $transition-speed $transition-ease;

    &:hover { opacity: 0.88; }
    &:active { transform: scale(0.98); }
  }
}
</style>