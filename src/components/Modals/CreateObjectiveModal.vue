<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>

          <!-- Botón cerrar -->
          <button class="modal-close" @click="handleClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- Campos del formulario -->
          <div class="modal-fields">

            <!-- Nombre del objetivo -->
            <input
              v-model="form.name"
              type="text"
              placeholder="Nombre del objetivo"
              class="modal-input"
              :class="{ 'modal-input--error': errors.name }"
              maxlength="50"
            />
            <p v-if="errors.name" class="field-error">{{ errors.name }}</p>

            <!-- Cantidad objetivo -->
            <div class="input-wrapper">
              <input
                v-model.number="form.target_amount"
                type="number"
                placeholder="Cantidad objetivo"
                class="modal-input"
                :class="{ 'modal-input--error': errors.target_amount }"
                min="1"
                step="0.01"
              />
              <span class="input-currency">€</span>
            </div>
            <p v-if="errors.target_amount" class="field-error">{{ errors.target_amount }}</p>

            <!-- Fecha límite -->
            <div class="date-wrapper">
              <input
                v-model="form.deadline"
                type="date"
                class="modal-input modal-input--date"
                :class="{ 'modal-input--error': errors.deadline }"
                :min="minDate"
              />
              <span v-if="!form.deadline" class="date-placeholder">Fecha límite (opcional)</span>
            </div>
            <p v-if="errors.deadline" class="field-error">{{ errors.deadline }}</p>

          </div>

          <!-- Botones de acción -->
          <div class="modal-actions">
            <button class="btn-cancel" @click="handleClose" :disabled="isCreating">
              Cancelar
            </button>
            <button class="btn-create" @click="handleCreate" :disabled="isCreating">
              {{ isCreating ? 'Creando...' : 'Crear objetivo' }}
            </button>
          </div>

          <!-- Mensaje de error general -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useObjectiveStore } from '@/stores/ObjectiveStore';

interface Props {
  isOpen: boolean;
  accountId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const objectiveStore = useObjectiveStore();

// ==================== ESTADO ====================

const form = ref({
  name: '',
  target_amount: null as number | null,
  deadline: ''
});

const errors = ref({
  name: '',
  target_amount: '',
  deadline: ''
});

const isCreating = ref(false);
const errorMessage = ref('');

// Fecha mínima = hoy
const minDate = new Date().toISOString().split('T')[0];

// ==================== VALIDACIÓN ====================

const validate = (): boolean => {
  errors.value = { name: '', target_amount: '', deadline: '' };
  let valid = true;

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio';
    valid = false;
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres';
    valid = false;
  }

  if (!form.value.target_amount || form.value.target_amount <= 0) {
    errors.value.target_amount = 'Introduce una cantidad válida';
    valid = false;
  }

  return valid;
};

// ==================== HANDLERS ====================

const handleCreate = async () => {
  if (!validate()) return;

  isCreating.value = true;
  errorMessage.value = '';

  try {
    // Construir deadline: si hay fecha, usarla; si no, poner un año por defecto
    const deadlineDate = form.value.deadline
      ? new Date(`${form.value.deadline}T23:59:59.000Z`).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    await objectiveStore.createObjective(props.accountId, {
      name: form.value.name.trim(),
      target_amount: Number(form.value.target_amount),
      deadline: deadlineDate
    });

    emit('created');
    handleClose();

  } catch (error: any) {
    errorMessage.value = error.message || 'Error al crear el objetivo. Inténtalo de nuevo.';
  } finally {
    isCreating.value = false;
  }
};

const handleClose = () => {
  if (isCreating.value) return;
  form.value = { name: '', target_amount: null, deadline: '' };
  errors.value = { name: '', target_amount: '', deadline: '' };
  errorMessage.value = '';
  emit('close');
};

// Limpiar errores al escribir
watch(() => form.value.name, () => { errors.value.name = ''; });
watch(() => form.value.target_amount, () => { errors.value.target_amount = ''; });
watch(() => form.value.deadline, () => { errors.value.deadline = ''; });
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
  padding: 30px;
}

.modal-content {
  background-color: $background-principal;
  border-radius: $section-border-radius;
  width: 100%;
  max-width: 440px;
  padding: 48px 24px 24px;
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

// ==================== CAMPOS ====================

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 20px;
}

.modal-input {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: $card-border-radius;
  background-color: $color-white ;
  font-size: 14px;
  color: $color-text;
  outline: none;
  transition: background-color $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;

  &::placeholder {
    color: $color-text-gray;
  }

  &:focus {
    background-color: darken(#e8e8e8, 3%);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
  }

  &--error {
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.4);
  }

  &--date {
    // Cuando tiene valor, muestra fecha normal
    color: $color-text;
    
    // Ocultar el placeholder nativo del input date en favor del nuestro
    &:not([value=""]):not(:invalid) {
      color: $color-text;
    }
  }

  // Quitar flechas de number
  &[type="number"] {
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
  }
}

// Input de cantidad con símbolo €
.input-wrapper {
  position: relative;

  .modal-input {
    padding-right: 40px;
  }

  .input-currency {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: $color-text-gray;
    pointer-events: none;
  }
}

// Wrapper de fecha (placeholder custom)
.date-wrapper {
  position: relative;

  .date-placeholder {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: $color-text-gray;
    pointer-events: none;
    // Solo visible cuando no hay valor
  }

  // Si el input tiene valor, ocultamos el placeholder custom
  &:has(input:not([value=""])) .date-placeholder {
    display: none;
  }
}

// Errores de campo
.field-error {
  font-size: 12px;
  color: $color-danger;
  margin: -6px 4px 0;
}

// ==================== ACCIONES ====================

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel,
.btn-create {
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

.btn-create {
  background-color: $color-text--dk;
  color: $color-white;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }
}

// Error general
.error-message {
  font-size: 12px;
  color: $color-danger;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: rgba(244, 67, 54, 0.08);
  border-radius: $small-border-radius;
  border-left: 3px solid $color-danger;
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