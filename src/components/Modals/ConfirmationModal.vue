<script setup lang="ts">
interface Props {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '¿Estás seguro?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  danger: true,
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-content">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="emit('cancel')">
            {{ cancelText }}
          </button>
          <button class="btn-confirm" :class="{ 'btn-danger': danger }" @click="emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: $card-border-radius;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 12px;
}

.modal-message {
  font-size: 1rem;
  color: $color-text-gray;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;

  button {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:active {
      opacity: 0.8;
    }
  }
}

.btn-cancel {
  background-color: #f0f0f0;
  color: $color-text;
}

.btn-confirm {
  background-color: $background-principal;
  color: white;
}

.btn-danger {
  background-color: $color-danger;
}
</style>
