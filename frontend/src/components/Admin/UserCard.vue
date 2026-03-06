<script setup lang="ts">
import { ref } from 'vue';
import { useAdminStore } from '@/stores/AdminStore'
import type { User } from '@/types/models';



interface Props {
  user: User;
}

const props = defineProps<Props>();
const emit = defineEmits<{ deleted: [userId: number] }>();

const adminStore = useAdminStore()
const isDeleting = ref(false)
const showConfirm = ref(false)

function getRoleClass(role: string): string {
  return role === 'Admin' ? 'user-card__role--admin' : 'user-card__role--user';
}

function getInitials(name: string): string {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

const handleDelete = async () => {
  isDeleting.value = true
  try {
    await adminStore.deleteUser(props.user.user_id)
    emit('deleted', props.user.user_id)
  } catch (error) {
    console.error('Error eliminando usuario:', error)
  } finally {
    isDeleting.value = false
    showConfirm.value = false
  }
}
</script>

<template>
  <div class="user-card">
    <div class="user-card__avatar">
      {{ getInitials(user.name) }}
    </div>

    <div class="user-card__info">
      <h4 class="user-card__name">{{ user.name }}</h4>
      <p class="user-card__email">{{ user.email }}</p>
    </div>

    <span class="user-card__role" :class="getRoleClass(user.role)">
      {{ user.role }}
    </span>

    <!-- Botón eliminar / confirmación -->
    <div class="user-card__delete-area">
      <button
        v-if="!showConfirm"
        class="user-card__delete-btn"
        @click.stop="showConfirm = true"
        title="Eliminar usuario"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div v-else class="user-card__confirm">
        <span class="user-card__confirm-text">¿Eliminar?</span>
        <button class="user-card__confirm-yes" :disabled="isDeleting" @click.stop="handleDelete">
          {{ isDeleting ? '...' : 'Sí' }}
        </button>
        <button class="user-card__confirm-no" @click.stop="showConfirm = false">No</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: $color-white;
  border-radius: $card-border-radius;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: $color-bg-item;
    color: $color-text;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__email {
    font-size: 13px;
    color: $color-text-gray;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__role {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;

    &--admin {
      background-color: $bg-danger;
      color: $bg-danger-text;
    }

    &--user {
      background-color: $bg-success;
      color: $bg-success-text;
    }
  }

  &__delete-area {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  &__delete-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: $color-text-gray;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color $transition-speed $transition-ease,
                color $transition-speed $transition-ease;

    &:hover {
      background-color: $bg-danger;
      color: $bg-danger-text;
    }
  }

  &__confirm {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__confirm-text {
    font-size: 12px;
    font-weight: 600;
    color: $color-text;
    white-space: nowrap;
  }

  &__confirm-yes,
  &__confirm-no {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: opacity $transition-speed $transition-ease;

    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &__confirm-yes {
    background-color: $color-danger;
    color: $color-white;
    &:hover:not(:disabled) { opacity: 0.85; }
  }

  &__confirm-no {
    background-color: $section-bg-secondary;
    color: $color-text;
    &:hover { opacity: 0.85; }
  }
}
</style>