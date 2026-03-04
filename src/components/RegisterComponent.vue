<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';

const router = useRouter();
const userStore = useUserStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const acceptTerms = ref(false);
const acceptPrivacy = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const hasMinLength = computed(() => password.value.length >= 6);
const hasUppercase = computed(() => /[A-Z]/.test(password.value));
const isValidPassword = computed(() => hasMinLength.value && hasUppercase.value);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!isValidPassword.value) {
    errorMessage.value = 'La contraseña debe tener mínimo 6 caracteres y 1 mayúscula';
    return;
  }

  if (!acceptTerms.value || !acceptPrivacy.value) {
    errorMessage.value = 'Debes aceptar los términos y la política de privacidad';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await userStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    });
    router.push('/home');
  } catch (error: any) {
    console.error('Error en registro:', error);
    errorMessage.value = error.message || 'Error al registrarse. Por favor, intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="card card__sign">
    <header class="card__header">
      <h3 class="card__subtitle">¡ Hola !</h3>
      <h2 class="card__title">Empecemos</h2>
    </header>

    <form class="register-form" @submit="handleSubmit">

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <div class="form-group__field">
          <span class="form-group__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </span>
          <input type="text" v-model="name" class="form-group__input" placeholder="Nombre" required
            :disabled="isLoading" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__field">
          <span class="form-group__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </span>
          <input type="email" v-model="email" class="form-group__input" placeholder="Correo electrónico" required
            :disabled="isLoading" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__field" style="position: relative">
          <span class="form-group__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </span>

          <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password-input"
            class="form-group__input" placeholder="Contraseña" required :disabled="isLoading" />

          <button type="button" id="toggle-password" class="form-group__toggle-btn" @click="togglePasswordVisibility">
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

        <div v-if="password" class="password-rules">
          <span :class="hasMinLength ? 'password-rules__rule--valid' : 'password-rules__rule--invalid'">
            Mínimo 6 caracteres
          </span>
          <span :class="hasUppercase ? 'password-rules__rule--valid' : 'password-rules__rule--invalid'">
            Al menos 1 mayúscula
          </span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__checkbox-container">
          <input type="checkbox" v-model="acceptTerms" class="form-group__checkbox" required :disabled="isLoading" />
          <span class="form-group__checkbox-text">
            He leido y acepto los
            <a href="#" class="form-group__checkbox-link">Términos y Condiciones</a>
          </span>
        </label>

        <label class="form-group__checkbox-container">
          <input type="checkbox" v-model="acceptPrivacy" class="form-group__checkbox" required :disabled="isLoading" />
          <span class="form-group__checkbox-text">
            He leido y acepto la
            <a href="#" class="form-group__checkbox-link">Política de Privacidad</a>
          </span>
        </label>
      </div>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Registrando...' : 'Enviar' }}
      </button>
    </form>
  </section>

  <section class="bottom">
    <p class="bottom__question">¿Ya tienes una cuenta?</p>
    <RouterLink to="/login" class="bottom__link">Inicia Sesión</RouterLink>
  </section>
</template>

<style scoped lang="scss">
.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid #f44336;
  padding: 12px 16px;
  border-radius: 8px;
  color: #c41e3a;
  font-size: 14px;
  margin-bottom: 1rem;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;

  &:hover {
    background-color: #353535 !important;
    transform: none !important;
  }
}

.form-group__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-rules {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(4px);

  &__rule--valid {
    font-size: 13px;
    color: #66bb6a;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 16px;
      height: 16px;
      background-color: #66bb6a;
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
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      box-sizing: border-box;
    }
  }

  &__rule--invalid {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      box-sizing: border-box;
    }
  }
}
</style>