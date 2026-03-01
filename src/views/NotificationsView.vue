<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import DebtNotificationsComponent from '@/components/Notifications/DebtNotificationsComponent.vue';

const router = useRouter();
const userStore = useUserStore();

const userId = computed(() => userStore.userId);

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
    <header class="notifications-header">
      <button class="notifications-header__back" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="notifications-header__title">Notificaciones</h1>
    </header>

    <main class="notifications-content">
      <DebtNotificationsComponent v-if="userId" :user-id="userId" />
    </main>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.notifications-view {
  min-height: 100vh;
  background-color: $background-principal;
}

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

.notifications-content {
  padding: 20px;
}
</style>