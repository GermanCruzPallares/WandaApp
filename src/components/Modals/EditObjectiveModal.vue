<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>

          <!-- Botón eliminar -->
          <button class="modal-delete" @click="handleDelete" :disabled="isSubmitting" title="Eliminar objetivo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
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

          <!-- Mensaje de error general -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <!-- Confirmación de borrado -->
          <div v-if="confirmingDelete" class="confirm-delete">
            <p class="confirm-delete__text">¿Eliminar este objetivo? Esta acción no se puede deshacer.</p>
            <div class="confirm-delete__actions">
              <button class="btn-cancel" @click="confirmingDelete = false">Cancelar</button>
              <button class="btn-delete-confirm" @click="confirmDelete" :disabled="isSubmitting">
                {{ isSubmitting ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>

          <!-- Botones de acción -->
          <div v-else class="modal-actions">
            <button class="btn-cancel" @click="handleClose" :disabled="isSubmitting">
              Cancelar
            </button>
            <button class="btn-save" @click="handleSave" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Editar objetivo' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useObjectiveStore } from '@/stores/ObjectiveStore';
import type { Objective } from '@/types/models';

interface Props {
  isOpen: boolean;
  accountId: number;
  objective: Objective | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  updated: [];
  deleted: [];
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

const isSubmitting = ref(false);
const errorMessage = ref('');
const confirmingDelete = ref(false);

const minDate = new Date().toISOString().split('T')[0];

// ==================== POPULATE FORM ====================

const toDateInputValue = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(String(date));
    const parts = d.toISOString().split('T');
    return parts[0] ?? '';
  } catch {
    return '';
  }
};

const populateForm = (objective: Objective) => {
  form.value.name = objective.name;
  form.value.target_amount = objective.target_amount;
  form.value.deadline = toDateInputValue(objective.deadline);
};

watch(() => props.isOpen, (val) => {
  if (val && props.objective) {
    populateForm(props.objective);
    errorMessage.value = '';
    confirmingDelete.value = false;
    errors.value = { name: '', target_amount: '', deadline: '' };
  }
});

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

// ==================== GUARDAR ====================

const handleSave = async () => {
  if (!validate() || !props.objective) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const deadlineDate = form.value.deadline
      ? new Date(`${form.value.deadline}T23:59:59.000Z`).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        await objectiveStore.updateObjective(props.objective.objective_id, {
        name: form.value.name.trim(),
        target_amount: Number(form.value.target_amount),
        current_save: props.objective.current_save, // ← preserva el valor actual
        deadline: deadlineDate
        });

    emit('updated');
    handleClose();

  } catch (error: any) {
    errorMessage.value = error.message || 'Error al actualizar el objetivo.';
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== ELIMINAR ====================

const handleDelete = () => {
  confirmingDelete.value = true;
};

const confirmDelete = async () => {
  if (!props.objective) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await objectiveStore.deleteObjective(props.objective.objective_id, props.accountId);
    emit('deleted');
    handleClose();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al eliminar el objetivo.';
    confirmingDelete.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== CERRAR ====================

const handleClose = () => {
  if (isSubmitting.value) return;
  form.value = { name: '', target_amount: null, deadline: '' };
  errors.value = { name: '', target_amount: '', deadline: '' };
  errorMessage.value = '';
  confirmingDelete.value = false;
  emit('close');
};

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

// ==================== BOTÓN ELIMINAR ====================

.modal-delete {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: $color-danger;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color $transition-speed $transition-ease;

  &:hover:not(:disabled) {
    background-color: rgba(244, 67, 54, 0.08);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
  background-color: $color-white;
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

  &[type="number"] {
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
  }
}

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
  }

  &:has(input:not([value=""])) .date-placeholder {
    display: none;
  }
}

.field-error {
  font-size: 12px;
  color: $color-danger;
  margin: -6px 4px 0;
}

// ==================== CONFIRMACIÓN BORRADO ====================

.confirm-delete {
  margin-bottom: 4px;

  &__text {
    font-size: 13px;
    color: $color-text;
    margin-bottom: 14px;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    gap: 10px;
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
.btn-save,
.btn-delete-confirm {
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

.btn-save {
  background-color: $color-text--dk;
  color: $color-white;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }
}

.btn-delete-confirm {
  background-color: $color-danger;
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