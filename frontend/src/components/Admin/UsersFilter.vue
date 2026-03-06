<!-- src/components/Admin/UsersFilter.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits<{
  'filter-change': [{ email: string; role: string }];
}>();

const email = ref('');
const role = ref('');

// Debounce para el email (no buscar en cada tecla)
let debounceTimer: ReturnType<typeof setTimeout>;

watch(email, (newEmail) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit('filter-change', { email: newEmail, role: role.value });
  }, 400);
});

watch(role, (newRole) => {
  emit('filter-change', { email: email.value, role: newRole });
});

function clearFilters() {
  email.value = '';
  role.value = '';
  emit('filter-change', { email: '', role: '' });
}
</script>

<template>
  <div class="users-filter">
    <!-- Búsqueda por email -->
    <div class="users-filter__field">
      <div class="users-filter__input-wrapper">
        <svg 
          class="users-filter__icon" 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <input
          v-model="email"
          type="text"
          class="users-filter__input"
          placeholder="Buscar por email..."
        />
      </div>
    </div>

    <!-- Filtro por rol -->
    <div class="users-filter__field">
      <select v-model="role" class="users-filter__select">
        <option value="">Todos los roles</option>
        <option value="Admin">Administradores</option>
        <option value="User">Usuarios</option>
      </select>
    </div>

    <!-- Botón limpiar -->
    <button 
      v-if="email || role"
      class="users-filter__clear"
      @click="clearFilters"
    >
      Limpiar filtros
    </button>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.users-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background-color: $color-white;
  border-radius: $card-border-radius;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;

  &__field {
    flex: 1;
    min-width: 200px;
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    position: absolute;
    left: 12px;
    color: $color-text-gray;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid $color-border;
    border-radius: $form-radius;
    font-size: 14px;
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
  }

  &__select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid $color-border;
    border-radius: $form-radius;
    font-size: 14px;
    color: $color-text;
    background-color: $form-input-bg;
    cursor: pointer;
    transition: border-color $transition-speed $transition-ease;

    &:focus {
      outline: none;
      border-color: $color-text;
    }
  }

  &__clear {
    padding: 10px 16px;
    background: none;
    border: 1px solid $color-border;
    border-radius: $form-radius;
    font-size: 13px;
    color: $color-text-gray;
    cursor: pointer;
    transition: all $transition-speed $transition-ease;
    white-space: nowrap;

    &:hover {
      border-color: $color-text;
      color: $color-text;
    }
  }
}
</style>