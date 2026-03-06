<!-- src/components/Admin/CreateAdminForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/AdminStore';

const adminStore = useAdminStore();

const form = ref({
  name: '',
  email: '',
  password: ''
});

const showPassword = ref(false);
const successMessage = ref('');

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length >= 2 &&
    isValidEmail(form.value.email) &&
    isValidPassword(form.value.password)
  );
});

const hasMinLength = computed(() => form.value.password.length >= 6);
const hasUppercase = computed(() => /[A-Z]/.test(form.value.password));

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 6 && /[A-Z]/.test(password);
}

async function handleSubmit() {
  if (!isFormValid.value) return;

  successMessage.value = '';

  const success = await adminStore.createAdmin({
    name: form.value.name.trim(),
    email: form.value.email.trim().toLowerCase(),
    password: form.value.password
  });

  if (success) {
    successMessage.value = `Administrador "${form.value.name}" creado exitosamente`
    form.value = { name: '', email: '', password: '' }

    await adminStore.fetchAllUsers()  

    setTimeout(() => {
      successMessage.value = ''
    }, 4000)

    if (adminStore.hasStats) {
      await adminStore.fetchSystemStats()
    }
  }
}

function clearError() {
  adminStore.createAdminError = null;
}
</script>

<template>
  <div class="create-admin-form">
    <div class="create-admin-form__header">
      <h3 class="create-admin-form__title">Crear Administrador</h3>
      <p class="create-admin-form__subtitle">Añade un nuevo usuario con permisos de administrador</p>
    </div>

    <form @submit.prevent="handleSubmit" class="create-admin-form__form">
      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="create-admin-form__success">
        {{ successMessage }}
      </div>

      <!-- Mensaje de error -->
      <div v-if="adminStore.createAdminError" class="create-admin-form__error">
        {{ adminStore.createAdminError }}
        <button type="button" class="create-admin-form__error-close" @click="clearError">×</button>
      </div>

      <!-- Campo Nombre -->
      <div class="create-admin-form__field">
        <label for="admin-name" class="create-admin-form__label">Nombre</label>
        <input id="admin-name" v-model="form.name" type="text" class="create-admin-form__input"
          placeholder="Nombre completo" autocomplete="name" />
      </div>

      <!-- Campo Email -->
      <div class="create-admin-form__field">
        <label for="admin-email" class="create-admin-form__label">Email</label>
        <input id="admin-email" v-model="form.email" type="email" class="create-admin-form__input"
          placeholder="correo@ejemplo.com" autocomplete="email" />
        <span v-if="form.email && !isValidEmail(form.email)"
          class="create-admin-form__hint create-admin-form__hint--error">
          Email no válido
        </span>
      </div>

      <!-- Campo Contraseña -->
      <div class="create-admin-form__field">
        <label for="admin-password" class="create-admin-form__label">Contraseña</label>
        <div class="create-admin-form__input-wrapper">
          <input id="admin-password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
            class="create-admin-form__input" placeholder="Mínimo 6 caracteres, 1 mayúscula"
            autocomplete="new-password" />
          <button type="button" class="create-admin-form__toggle-password" @click="showPassword = !showPassword"
            aria-label="Mostrar contraseña">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
              </path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>

        <!-- Reglas de contraseña con nuevo estilo -->
        <div v-if="form.password" class="password-rules">
          <span :class="hasMinLength ? 'password-rules__rule--valid' : 'password-rules__rule--invalid'">
            Mínimo 6 caracteres
          </span>
          <span :class="hasUppercase ? 'password-rules__rule--valid' : 'password-rules__rule--invalid'">
            Al menos 1 mayúscula
          </span>
        </div>
      </div>

      <!-- Botón Submit -->
      <button type="submit" class="create-admin-form__submit" :disabled="!isFormValid || adminStore.isCreatingAdmin">
        <span v-if="adminStore.isCreatingAdmin">Creando...</span>
        <span v-else>Crear Administrador</span>
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.create-admin-form {
  background-color: $color-white;
  border-radius: $card-border-radius;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 4px 0;
  }

  &__subtitle {
    font-size: 14px;
    color: $color-text-gray;
    margin: 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__success {
    padding: 12px 16px;
    background-color: $bg-success;
    color: $bg-success-text;
    border-radius: $form-radius;
    font-size: 14px;
    font-weight: 500;
  }

  &__error {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: $bg-danger;
    color: $bg-danger-text;
    border-radius: $form-radius;
    font-size: 14px;
  }

  &__error-close {
    background: none;
    border: none;
    color: $bg-danger-text;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;

    &:hover {
      opacity: 0.7;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: $color-text;
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 48px;
    border: 1px solid $color-border;
    border-radius: $form-radius;
    font-size: 15px;
    color: $color-text;
    background-color: $form-input-bg;
    transition: border-color $transition-speed $transition-ease;

    &::placeholder {
      color: $color-text-gray;
    }

    &:focus {
      outline: none;
      border-color: $color-text;
    }

    &--error {
      border-color: $color-danger;
    }
  }

  &__toggle-password {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: $color-text-gray;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color $transition-speed $transition-ease;

    &:hover {
      color: $color-text;
    }
  }

  &__hint {
    font-size: 12px;
    color: $color-text-gray;

    &--error {
      color: $color-danger;
    }
  }

  &__submit {
    margin-top: 8px;
    padding: 14px 24px;
    background-color: $color-text;
    color: $color-white;
    border: none;
    border-radius: 22px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity $transition-speed $transition-ease;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// Reglas de contraseña con estilo profesional
.password-rules {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  padding: 12px 16px;
  background-color: $section-bg-tertiary;
  border-radius: $form-radius;

  &__rule--valid {
    font-size: 13px;
    color: $color-success;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 16px;
      height: 16px;
      background-color: $color-success;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  &__rule--invalid {
    font-size: 13px;
    color: $color-text-gray;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 16px;
      height: 16px;
      border: 2px solid $color-border;
      border-radius: 50%;
      box-sizing: border-box;
    }
  }
}
</style>