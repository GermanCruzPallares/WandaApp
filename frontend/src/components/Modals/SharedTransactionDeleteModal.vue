<script setup lang="ts">
import type { Transaction } from '@/types/models'

interface Props {
  transaction: Transaction | null
  isOpen: boolean
  isDeleting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
          <div class="delete-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <h3 class="modal-title">Eliminar Gasto Compartido</h3>

          <p class="modal-message">
            Este es un gasto compartido. Al eliminarlo, también desaparecerán las solicitudes de
            deuda enviadas a tus compañeros.
          </p>

          <div v-if="transaction" class="transaction-preview">
            <span class="preview-concept">{{ transaction.concept || transaction.category }}</span>
            <span class="preview-amount"
              >-{{ transaction.amount.toFixed(2).replace('.', ',') }} €</span
            >
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="emit('close')" :disabled="isDeleting">
              Cancelar
            </button>
            <button class="btn-delete" @click="emit('confirm')" :disabled="isDeleting">
              <span v-if="!isDeleting">Eliminar para todos</span>
              <span v-else class="loader"></span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.delete-icon {
  width: 64px;
  height: 64px;
  background-color: rgba(220, 53, 69, 0.1);
  color: $color-danger;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: $color-text;
  margin-bottom: 12px;
}

.modal-message {
  font-size: 0.95rem;
  color: $color-text-gray;
  margin-bottom: 24px;
  line-height: 1.5;
}

.transaction-preview {
  background-color: $section-bg-primary;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .preview-concept {
    font-weight: 600;
    color: $color-text;
    font-size: 0.9rem;
  }

  .preview-amount {
    font-weight: 700;
    color: $color-danger;
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
}

button {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-cancel {
  background-color: #f5f5f5;
  color: $color-text;

  &:hover:not(:disabled) {
    background-color: #eee;
  }
}

.btn-delete {
  background-color: $color-danger;
  color: white;

  &:hover:not(:disabled) {
    background-color: darken($color-danger, 5%);
    transform: translateY(-1px);
  }
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
  .modal-content {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  .modal-content {
    transform: scale(0.9) translateY(20px);
  }
}
</style>
