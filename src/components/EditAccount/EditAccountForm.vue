<template>
  <div class="edit-account-form">
    <!-- Avatar Section -->
    <div class="avatar-section">
      <div class="avatar-container" @click="handleAvatarClick">
        <img 
          :src="formData.account_picture_url || defaultAvatar" 
          :alt="formData.name"
          class="avatar-image"
        />
        <div class="avatar-overlay">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>
          </svg>
        </div>
      </div>
      <button class="edit-photo-btn" @click="handleAvatarClick">
        Editar foto
      </button>
    </div>


    <form class="account-form" @submit.prevent="handleSubmit">

      <div class="form-field">
        <label class="field-label">Nombre</label>
        <input
          v-model="formData.name"
          type="text"
          class="field-input"
          :class="{ 'field-input--error': errors.name }"
          placeholder="Nombre de la cuenta"
          maxlength="50"
        />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>

    <div v-if="formData.account_type === 'personal'" class="form-field">
      <label class="field-label">Saldo</label>
      <div class="field-input-wrapper">
        <input
          v-model.number="formData.amount"
          type="number"
          class="field-input"
          :class="{ 'field-input--error': errors.amount }"
          placeholder="0,00"
          step="0.01"
          min="0"
        />
        <span class="field-currency">€</span>
      </div>
      <p v-if="errors.amount" class="field-error">{{ errors.amount }}</p>
    </div>

      <div class="form-field">
        <label class="field-label">Presupuesto mensual</label>
        <div class="field-input-wrapper">
          <input
            v-model.number="formData.monthly_budget"
            type="number"
            class="field-input"
            :class="{ 'field-input--error': errors.monthly_budget }"
            placeholder="0,00"
            step="0.01"
            min="0"
          />
          <span class="field-currency">€</span>
        </div>
        <p v-if="errors.monthly_budget" class="field-error">{{ errors.monthly_budget }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">Presupuesto semanal</label>
        <div class="field-input-wrapper">
          <input
            v-model.number="formData.weekly_budget"
            type="number"
            class="field-input"
            :class="{ 'field-input--error': errors.weekly_budget }"
            placeholder="0,00"
            step="0.01"
            min="0"
          />
          <span class="field-currency">€</span>
        </div>
        <p v-if="errors.weekly_budget" class="field-error">{{ errors.weekly_budget }}</p>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="btn-cancel"
          @click="handleCancel"
          :disabled="isSaving"
        >
          Cancelar
        </button>
        
        <button 
          type="submit" 
          class="btn-save"
          :disabled="!hasChanges || isSaving"
        >
          <span v-if="isSaving">Guardando...</span>
          <span v-else>Guardar cambios</span>
        </button>
      </div>

      <div v-if="showSuccessMessage" class="success-message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
          <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Cambios guardados correctamente</span>
      </div>

      <div v-if="saveError" class="error-message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#f44336"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>{{ saveError }}</span>
      </div>
    </form>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isPhotoModalOpen" class="photo-modal-overlay" @click="closePhotoModal">
          <div class="photo-modal" @click.stop>
            <button class="modal-close" @click="closePhotoModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            
            <h2 class="modal-title">Cambiar foto de perfil</h2>
            
            <div class="photo-options">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              
              <button class="photo-option" @click="triggerFileInput">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Subir imagen</span>
              </button>
              
              <button class="photo-option" @click="removePhoto" :disabled="!formData.account_picture_url">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Eliminar foto</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import type { Account } from '@/types/models';

interface Props {
  accountId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  saved: [account: Account];
  cancelled: [];
}>();

// ==================== STORES ====================

const accountStore = useAccountStore();

// ==================== ESTADO LOCAL ====================

const formData = ref({
  name: '',
  account_picture_url: '',
  monthly_budget: 0,
  weekly_budget: 0,
  amount: 0,
  account_type: 'personal' as 'personal' | 'joint'
});

const originalData = ref({ ...formData.value });

const errors = ref({
  name: '',
  amount: '',
  monthly_budget: '',
  weekly_budget: ''
});

const isSaving = ref(false);
const showSuccessMessage = ref(false);
const saveError = ref('');
const isPhotoModalOpen = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// ==================== COMPUTED ====================

const defaultAvatar = computed(() => {
  return getAvatarDataUrl(formData.value.account_type);
});

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(formData.value.amount);
});

const hasChanges = computed(() => {
  return (
    formData.value.name !== originalData.value.name ||
    formData.value.account_picture_url !== originalData.value.account_picture_url ||
    formData.value.amount !== originalData.value.amount || // ✅ Incluir amount
    formData.value.monthly_budget !== originalData.value.monthly_budget ||
    formData.value.weekly_budget !== originalData.value.weekly_budget
  );
});

// ==================== MÉTODOS ====================

const loadAccountData = async () => {
  try {
    const account = await accountStore.fetchAccount(props.accountId);
    
    if (account) {
      formData.value = {
        name: account.name,
        account_picture_url: account.account_picture_url || '',
        monthly_budget: account.monthly_budget,
        weekly_budget: account.weekly_budget,
        amount: account.amount,
        account_type: account.account_type
      };
      
      originalData.value = { ...formData.value };
    }
  } catch (error) {
    console.error('❌ Error cargando datos de cuenta:', error);
    saveError.value = 'Error al cargar los datos de la cuenta';
  }
};

const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    name: '',
    amount: '',
    monthly_budget: '',
    weekly_budget: ''
  };

  // Validar nombre
  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio';
    isValid = false;
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres';
    isValid = false;
  }

  // Validar saldo
  if (formData.value.amount < 0) {
    errors.value.amount = 'El saldo no puede ser negativo';
    isValid = false;
  }

  // Validar presupuesto mensual
  if (formData.value.monthly_budget < 0) {
    errors.value.monthly_budget = 'El presupuesto no puede ser negativo';
    isValid = false;
  }

  // Validar presupuesto semanal
  if (formData.value.weekly_budget < 0) {
    errors.value.weekly_budget = 'El presupuesto no puede ser negativo';
    isValid = false;
  }

  // Validar que el presupuesto semanal no sea mayor que el mensual
  if (formData.value.weekly_budget > formData.value.monthly_budget) {
    errors.value.weekly_budget = 'El presupuesto semanal no puede ser mayor que el mensual';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSaving.value = true;
  saveError.value = '';
  showSuccessMessage.value = false;

  try {

    const updateData = {
      name: formData.value.name.trim(),
      amount: formData.value.account_type === 'personal' ? Number(formData.value.amount) : 0,
      monthly_budget: Number(formData.value.monthly_budget),
      weekly_budget: Number(formData.value.weekly_budget),
      account_picture_url: formData.value.account_picture_url || ''
    };
    
    console.log('📤 Datos a enviar:', updateData);


    await accountStore.updateAccount(props.accountId, updateData);

    originalData.value = { ...formData.value };


    showSuccessMessage.value = true;
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);

    const updatedAccount = await accountStore.fetchAccount(props.accountId);
    if (updatedAccount) {
      emit('saved', updatedAccount);
    }

  } catch (error: any) {
    console.error('❌ Error guardando cambios:', error);
    saveError.value = error.message || 'Error al guardar los cambios. Por favor, intenta de nuevo.';
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {

  formData.value = { ...originalData.value };
  errors.value = {
    name: '',
    amount: '',
    monthly_budget: '',
    weekly_budget: ''
  };
  saveError.value = '';
  emit('cancelled');
};

// ==================== GESTIÓN DE FOTO ====================

const handleAvatarClick = () => {
  isPhotoModalOpen.value = true;
};

const closePhotoModal = () => {
  isPhotoModalOpen.value = false;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      saveError.value = 'Por favor, selecciona una imagen válida';
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      saveError.value = 'La imagen no puede superar los 5MB';
      return;
    }

    // Convertir a base64 y guardar
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.account_picture_url = e.target?.result as string;
      closePhotoModal();
    };
    reader.readAsDataURL(file);
  }
};

const removePhoto = () => {
  formData.value.account_picture_url = '';
  closePhotoModal();
};

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadAccountData();
});

// Recargar si cambia el accountId
watch(() => props.accountId, () => {
  loadAccountData();
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.edit-account-form {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 16px 40px;

  @media (min-width: 768px) {
    padding: 0 32px 40px;
  }
}

// ==================== AVATAR SECTION ====================

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
  transition: transform $transition-speed $transition-ease;

  &:hover {
    transform: scale(1.05);

    .avatar-overlay {
      opacity: 1;
    }
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity $transition-speed $transition-ease;
}

.edit-photo-btn {
  background: none;
  border: none;
  color: $color-text;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: background-color $transition-speed $transition-ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

// ==================== FORM ====================

.account-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-size: 15px;
  font-weight: 600;
  color: $color-text;
}

.field-input,
.field-display {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid #e5e5e5;
  border-radius: $card-border-radius;
  font-size: 16px;
  color: $color-text;
  background-color: $color-white;
  transition: border-color $transition-speed $transition-ease;

  &:focus {
    outline: none;
    border-color: $color-text;
  }

  &--error {
    border-color: $color-danger;
  }
}

.field-display {
  background-color: #f5f5f5;
  cursor: not-allowed;
  font-weight: 600;
}

.field-display-value {
  font-weight: 600;
  color: $color-text;
}

.field-input-wrapper {
  position: relative;
  
  .field-input {
    padding-right: 50px; // Espacio para el símbolo €
  }
}

.field-currency {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: $color-text-gray;
  font-weight: 500;
  pointer-events: none;
}

.field-error {
  font-size: 12px;
  color: $color-danger;
  margin: 0;
}

// ==================== ACTIONS ====================

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 50px;
  font-size: 15px;
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
    opacity: 0.9;
  }
}

.btn-save {
  background-color: #353535;
  color: $color-white;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

// ==================== MESSAGES ====================

.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: $card-border-radius;
  font-size: 14px;
  animation: slideIn 0.3s ease;
}

.success-message {
  background-color: $bg-success;
  color: $bg-success-text;
}

.error-message {
  background-color: $bg-danger;
  color: $bg-danger-text;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ==================== PHOTO MODAL ====================

.photo-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.photo-modal {
  background-color: $background-principal;
  border-radius: $card-border-radius;
  width: 100%;
  max-width: 400px;
  padding: 32px 24px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
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
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: $color-text;
  margin: 0 0 24px 0;
}

.photo-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: $color-white;
  border: 1px solid #e5e5e5;
  border-radius: $card-border-radius;
  cursor: pointer;
  color: $color-text;
  font-size: 14px;
  font-weight: 500;
  transition: background-color $transition-speed $transition-ease;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    color: $color-text-gray;
  }
}

// Animaciones del modal
.modal-enter-active,
.modal-leave-active {
  transition: opacity $transition-speed $transition-ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .photo-modal,
.modal-leave-active .photo-modal {
  transition: transform $transition-speed $transition-ease;
}

.modal-enter-from .photo-modal,
.modal-leave-to .photo-modal {
  transform: scale(0.95);
}
</style>