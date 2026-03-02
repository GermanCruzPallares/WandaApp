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
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <span class="modal-header__name">Presupuesto {{ budgetTypeLabel }}</span>
          </div>

          <!-- Input de cantidad -->
          <div class="amount-field">
            <label class="amount-field__label">Nuevo importe</label>
            <div class="amount-field__wrapper">
              <input
                ref="inputRef"
                v-model="amountInput"
                type="number"
                min="0"
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
            <button class="btn-confirm" @click="handleConfirm" :disabled="isSubmitting || amountInput === null">
              {{ isSubmitting ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';

interface Props {
  isOpen: boolean;
  accountId: number;
  budgetType: 'weekly' | 'monthly';
  currentValue: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const accountStore = useAccountStore();

const amountInput = ref<number | null>(null);
const isSubmitting = ref(false);
const errorMessage = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// ==================== COMPUTED ====================

const budgetTypeLabel = computed(() =>
  props.budgetType === 'weekly' ? 'Semanal' : 'Mensual'
);

// ==================== SUBMIT ====================

const handleConfirm = async () => {
  const numericAmount = amountInput.value;

  if (numericAmount === null || numericAmount < 0) {
    errorMessage.value = 'Introduce un importe válido';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const updateData =
      props.budgetType === 'weekly'
        ? { weekly_budget: numericAmount }
        : { monthly_budget: numericAmount };

    await accountStore.updateAccount(props.accountId, updateData);

    emit('updated');
    handleClose();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al actualizar el presupuesto.';
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

    amountInput.value = props.currentValue ?? null;
    errorMessage.value = '';
    await nextTick();
    inputRef.value?.focus();
    inputRef.value?.select();
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