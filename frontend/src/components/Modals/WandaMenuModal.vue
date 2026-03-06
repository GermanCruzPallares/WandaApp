<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div v-if="isOpen" class="wanda-menu-overlay" @click="$emit('close')" />
    </Transition>

    <!-- Menú posicionado via JS relativo al logo -->
    <Transition name="menu">
      <div
        v-if="isOpen"
        class="wanda-menu"
        :style="{ top: menuTop + 'px', left: menuLeft + 'px' }"
      >
        <nav class="wanda-menu__items">
          <button class="wanda-menu__item" @click="handleNotifications">
            <div class="wanda-menu__item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="wanda-menu__item-label">Notificaciones</span>
            <svg class="wanda-menu__item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="wanda-menu__item wanda-menu__item--danger" @click="handleLogout">
            <div class="wanda-menu__item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="wanda-menu__item-label">Cerrar sesión</span>
          </button>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';

const props = defineProps<{
  isOpen: boolean;
  anchorEl?: HTMLElement | null; // referencia al elemento logo
}>();

const emit = defineEmits<{ close: [] }>();

const router = useRouter();
const userStore = useUserStore();

const menuTop = ref(0);
const menuLeft = ref(0);

// Calcular posición cuando se abre
watch(() => props.isOpen, async (open) => {
  if (open && props.anchorEl) {
    await nextTick();
    const rect = props.anchorEl.getBoundingClientRect();
    menuTop.value = rect.bottom + 8;
    menuLeft.value = rect.left;
  }
});

const handleNotifications = () => {
  emit('close');
  router.push('/notifications');
};

const handleLogout = () => {
  emit('close');
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.wanda-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1099;
}

.wanda-menu {
  position: fixed;
  z-index: 1100;
  width: 210px;
  background-color: $color-white;
  border: 1px solid #e8e8e8;
  border-radius: $card-border-radius;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;

  &__items {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 11px 12px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: background-color $transition-speed $transition-ease;

    &:hover { background-color: $section-bg-primary; }
    &:active { background-color: $section-bg-secondary; }

    &--danger {
      .wanda-menu__item-icon { color: $color-danger; }
      .wanda-menu__item-label { color: $color-danger; }
      &:hover { background-color: rgba(220, 53, 69, 0.06); }
    }
  }

  &__item-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: $section-bg-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text;
    flex-shrink: 0;
  }

  &__item-label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: $color-text;
  }

  &__item-arrow {
    color: $color-text-gray;
    flex-shrink: 0;
  }
}

.overlay-enter-active,
.overlay-leave-active { transition: opacity 0.15s ease; }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }

.menu-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.menu-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>