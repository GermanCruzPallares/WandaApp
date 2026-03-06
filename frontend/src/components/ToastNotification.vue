<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { isVisible, message, type, hideToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="isVisible" class="toast-notification" :class="type" @click="hideToast">
        <div class="toast-content">
          <span class="icon" v-if="type === 'success'">✓</span>
          <span class="icon" v-else-if="type === 'error'">✕</span>
          <span class="icon" v-else>ℹ</span>
          <p>{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.toast-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  min-width: 300px;
  max-width: 90vw;
  padding: 16px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  &.success {
    background-color: rgba(255, 255, 255, 0.95);
    border: 1px solid #e0e0e0;
    color: #2e7d32;

    .icon {
      background: #e8f5e9;
      color: #2e7d32;
    }
  }

  &.error {
    background-color: rgba(255, 255, 255, 0.95);
    border: 1px solid #ffebee;
    color: #c62828;

    .icon {
      background: #ffebee;
      color: #c62828;
    }
  }

  &.info {
    background-color: rgba(255, 255, 255, 0.95);
    border: 1px solid #e3f2fd;
    color: #1565c0;

    .icon {
      background: #e3f2fd;
      color: #1565c0;
    }
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
    }

    p {
      margin: 0;
      font-size: 15px;
      font-weight: 500;
    }
  }
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}
</style>
