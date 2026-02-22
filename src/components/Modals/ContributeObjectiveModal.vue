<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>

          <!-- Botón cerrar -->
          <button class="modal-close" @click="handleClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- Cabecera: icono + nombre objetivo -->
          <div class="modal-header">
            <div class="modal-header__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="modal-header__name">{{ objectiveName }}:</span>
          </div>

          <!-- Input de cantidad -->
          <div class="amount-display">
            <span class="amount-display__value">{{ formattedAmount }} €</span>
          </div>

          <!-- Teclado numérico -->
          <div class="keypad">
            <button
              v-for="key in keys"
              :key="key"
              class="keypad__btn"
              :class="{ 'keypad__btn--wide': key === '0', 'keypad__btn--delete': key === '⌫' }"
              @click="handleKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Mensaje de error -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <!-- Acciones -->
          <div class="modal-actions">
            <button class="btn-cancel" @click="handleClose" :disabled="isSubmitting">
              Cancelar
            </button>
            <button class="btn-confirm" @click="handleConfirm" :disabled="isSubmitting || amount === '0'">
              {{ isSubmitting ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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

// ==================== ESTADO ====================

const amount = ref('0');
const isSubmitting = ref(false);
const errorMessage = ref('');

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'];

// ==================== COMPUTED ====================

const formattedAmount = computed(() => {
  return amount.value.replace('.', ',');
});

// ==================== TECLADO ====================

const handleKey = (key: string) => {
  errorMessage.value = '';

  if (key === '⌫') {
    amount.value = amount.value.length > 1 ? amount.value.slice(0, -1) : '0';
    return;
  }

  if (key === ',') {
    if (amount.value.includes(',')) return;
    amount.value += ',';
    return;
  }

  if (amount.value === '0') {
    amount.value = key;
  } else {
    // Máximo 2 decimales
    const parts = amount.value.split(',');
    if (parts[1] !== undefined && parts[1].length >= 2) return;
    amount.value += key;
  }
};

// ==================== SUBMIT ====================

const handleConfirm = async () => {
  const numericAmount = parseFloat(amount.value.replace(',', '.'));

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
  amount.value = '0';
  errorMessage.value = '';
  emit('close');
};

// Resetear al abrir
watch(() => props.isOpen, (val) => {
  if (val) {
    amount.value = '0';
    errorMessage.value = '';
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
  margin-bottom: 24px;

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

// ==================== CANTIDAD ====================

.amount-display {
  background-color: $color-white;
  border-radius: $card-border-radius;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;

  &__value {
    font-size: 32px;
    font-weight: 600;
    color: $color-text;
    letter-spacing: -0.5px;
  }
}

// ==================== TECLADO ====================

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;

  &__btn {
    background-color: $color-white;
    border: none;
    border-radius: $card-border-radius;
    padding: 16px;
    font-size: 18px;
    font-weight: 500;
    color: $color-text;
    cursor: pointer;
    transition: background-color $transition-speed $transition-ease,
                transform 0.1s ease;

    &:active {
      transform: scale(0.95);
      background-color: darken(#ffffff, 6%);
    }

    &--delete {
      color: $color-text-gray;
    }
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