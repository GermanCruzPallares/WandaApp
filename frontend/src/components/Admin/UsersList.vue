<!-- src/components/Admin/UsersList.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '@/stores/AdminStore';
import UserCard from './UserCard.vue';
import UsersFilter from './UsersFilter.vue';

const adminStore = useAdminStore();

const currentFilters = ref({ email: '', role: '' });

// Filtrar usuarios en memoria por rol
const filteredUsers = computed(() => {
  let users = adminStore.users;

  if (currentFilters.value.role) {
    users = users.filter(user => user.role === currentFilters.value.role);
  }

  return users;
});

async function handleFilterChange(filters: { email: string; role: string }) {
  currentFilters.value = filters;

  // Buscar por email en el servidor
  await adminStore.fetchAllUsers(filters.email || undefined);
}

onMounted(async () => {
  await adminStore.fetchAllUsers();
});
</script>

<template>
  <div class="users-list">
    <!-- Filtros -->
    <UsersFilter @filter-change="handleFilterChange" />

    <!-- Loading State -->
    <div v-if="adminStore.isLoadingUsers" class="users-list__loading">
      <span>Cargando usuarios...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="adminStore.usersError" class="users-list__error">
      <span>{{ adminStore.usersError }}</span>
      <button @click="adminStore.fetchAllUsers()">Reintentar</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="users-list__empty">
      <span v-if="currentFilters.email || currentFilters.role">
        No se encontraron usuarios con los filtros aplicados
      </span>
      <span v-else>No hay usuarios registrados</span>
    </div>

    <!-- Users Grid -->
    <div v-else class="users-list__grid">
      <UserCard v-for="user in filteredUsers" :key="user.user_id" :user="user"
        @deleted="adminStore.users = adminStore.users.filter(u => u.user_id !== $event)" />
    </div>

    <!-- Contador de resultados -->
    <div v-if="!adminStore.isLoadingUsers && filteredUsers.length > 0" class="users-list__count">
      {{ filteredUsers.length }} usuario{{ filteredUsers.length !== 1 ? 's' : '' }} encontrado{{ filteredUsers.length
        !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.users-list {
  padding: 0 $section-margin-horizontal;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__loading,
  &__error,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px;
    background-color: $color-white;
    border-radius: $card-border-radius;
    text-align: center;
    color: $color-text-gray;

    button {
      padding: 10px 20px;
      background-color: $color-text;
      color: $color-white;
      border: none;
      border-radius: $form-radius;
      cursor: pointer;
      font-weight: 500;
      transition: opacity $transition-speed $transition-ease;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  &__error {
    color: $bg-danger-text;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  &__count {
    text-align: center;
    font-size: 13px;
    color: $color-text-gray;
    padding: 8px 0;
  }
}
</style>