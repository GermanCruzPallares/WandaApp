<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';

const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  
  // Validación básica
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, completa todos los campos';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await userStore.login(email.value, password.value);

    console.log('✅ Login exitoso');
    
    // Redirigir a la home
    router.push('/home');
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    errorMessage.value = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="card card__login">
    <header class="card__header">
      <h3 class="card__subtitle">¡ Bienvenido de nuevo !</h3>
      <h2 class="card__title">Accede a tu cuenta</h2>
    </header>

    <form class="auth-form" @submit="handleSubmit">
      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <div class="form-group__field">
          <span class="form-group__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
          </span>
          <input 
            type="email" 
            v-model="email"
            class="form-group__input" 
            placeholder="Correo electrónico" 
            required 
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__field" style="position: relative">
          <span class="form-group__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              />
            </svg>
          </span>

          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            id="password-input"
            class="form-group__input"
            placeholder="Contraseña"
            required
            :disabled="isLoading"
          />

          <button 
            type="button" 
            id="toggle-password" 
            class="form-group__toggle-btn"
            @click="togglePasswordVisibility"
          >
            <svg
              id="eye-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
        
              <line v-if="showPassword" x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Iniciando sesión...' : 'Enviar' }}
      </button>
    </form>
  </section>

  <section class="bottom">
      <p class="bottom__question">¿No tienes una cuenta?</p>
      <RouterLink to="/register"><a href="./signUp.html" class="bottom__link">Regístrate</a></RouterLink>
  </section>

</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}

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
}

.form-group__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>