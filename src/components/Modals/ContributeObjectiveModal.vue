<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>

          <button class="modal-close" @click="handleClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="modal-header">
            <div class="modal-header__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="modal-header__name">{{ objectiveName }}</span>
          </div>

          <div class="amount-field">
            <label class="amount-field__label">Cantidad a aportar</label>
            <div class="amount-field__wrapper">
              <input
                ref="inputRef"
                v-model="amountInput"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                class="amount-field__input"
                @keydown.enter="handleConfirm"
              />
              <span class="amount-field__currency">€</span>
            </div>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="handleClose" :disabled="isSubmitting">
              Cancelar
            </button>
            <button class="btn-confirm" @click="handleConfirm" :disabled="isSubmitting || !amountInput">
              {{ isSubmitting ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useTransactionStore } from '@/stores/TransactionStore';
import { useUserStore } from '@/stores/UserStore';

interface Props {
  isOpen: boolean;
  accountId: number;
  objectiveId: number;
  objectiveName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  contributed: [];
}>();

const transactionStore = useTransactionStore();
const userStore = useUserStore();

const amountInput = ref<number | null>(null);
const isSubmitting = ref(false);
const errorMessage = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// ==================== SUBMIT ====================

const handleConfirm = async () => {
  const numericAmount = amountInput.value;

  if (!numericAmount || numericAmount <= 0) {
    errorMessage.value = 'Introduce una cantidad válida';
    return;
  }

  if (!userStore.userId) {
    errorMessage.value = 'Error de sesión. Recarga la página.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await transactionStore.createTransaction(props.accountId, {
      user_id: userStore.userId,
      objective_id: props.objectiveId,
      category: 'Ahorro',
      amount: numericAmount,
      transaction_type: 'saving',
      concept: `Ahorro ${props.objectiveName}`,
      transaction_date: new Date().toISOString(),
      isRecurring: false,
      frequency: null,
      end_date: null,
      split_type: 'individual',
    });

    emit('contributed');
    handleClose();

  } catch (error: any) {
    errorMessage.value = error.message || 'Error al registrar la aportación.';
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== RESET ====================

const handleClose = () => {
  if (isSubmitting.value) return;
  amountInput.value = null;
  errorMessage.value = '';
  emit('close');
};

watch(() => props.isOpen, async (val) => {
  if (val) {
    amountInput.value = null;
    errorMessage.value = '';
    await nextTick();
    inputRef.value?.focus();
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background-color: $background-principal;
  border-radius: $section-border-radius;
  width: 100%;
  max-width: 360px;
  padding: 48px 24px 28px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: $color-text-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color $transition-speed $transition-ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
}

// ==================== HEADER ====================

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;

  &__icon {
    width: 44px;
    height: 44px;
    background-color: $color-text-gray;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    flex-shrink: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $color-text;
  }
}

// ==================== INPUT CANTIDAD ====================

.amount-field {
  margin-bottom: 20px;

  &__label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: $color-text-gray;
    margin-bottom: 8px;
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    padding: 16px 48px 16px 16px;
    font-size: 24px;
    font-weight: 600;
    color: $color-text;
    background-color: $color-white;
    border: 2px solid transparent;
    border-radius: $card-border-radius;
    outline: none;
    transition: border-color $transition-speed $transition-ease;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &::placeholder {
      color: $color-text-gray;
      opacity: 0.5;
    }

    &:focus {
      border-color: $color-text--dk;
    }
  }

  &__currency {
    position: absolute;
    right: 16px;
    font-size: 22px;
    font-weight: 600;
    color: $color-text-gray;
    pointer-events: none;
  }
}

// ==================== ERROR ====================

.error-message {
  font-size: 12px;
  color: $color-danger;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: rgba(244, 67, 54, 0.08);
  border-radius: $small-border-radius;
  border-left: 3px solid $color-danger;
}

// ==================== ACCIONES ====================

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity $transition-speed $transition-ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-cancel {
  background-color: $section-bg-secondary;
  color: $color-text;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.btn-confirm {
  background-color: $color-text--dk;
  color: $color-white;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }
}

// ==================== ANIMACIONES ====================

.modal-enter-active,
.modal-leave-active {
  transition: opacity $transition-speed $transition-ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform $transition-speed $transition-ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>