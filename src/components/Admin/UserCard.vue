
<script setup lang="ts">
import type { User } from '@/types/models';

interface Props {
  user: User;
}

defineProps<Props>();

function getRoleClass(role: string): string {
  return role === 'Admin' ? 'user-card__role--admin' : 'user-card__role--user';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
}
</style>