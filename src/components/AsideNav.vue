<template>
  <aside class="aside-nav">
    <!-- Logo -->
    <div class="aside-nav__logo">
      <img src="../images/OscuroPrincipal.png" alt="Wanda Logo" class="logo-image" />
    </div>

    <!-- Menú principal de navegación -->
    <nav class="aside-nav__menu">
      <button
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        :class="{ 'menu-item--active': item.id === activeItem }"
        @click="handleMenuClick(item.id)"
      >
        <component 
          :is="item.icon" 
          :is-active="item.id === activeItem"
          class="menu-item__icon" 
        />
        <span class="menu-item__label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="aside-nav__footer">
      <button class="user-button" @click="handleAvatarClick">
        <img 
          :src="currentAvatar" 
          alt="User avatar"
          class="user-button__avatar"
        />
        <span class="user-button__name">{{ currentUserName }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AccountUI } from '@/types/models';
import HomeIcon from './icons/HomeIcon.vue';
import PlusIcon from './icons/PlusIcon.vue';
import CalculatorIcon from './icons/CalculatorIcon.vue';
import UserIcon from './icons/UserIcon.vue';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

interface Props {
  activeItem?: string;
  accounts?: AccountUI[];
}

const props = withDefaults(defineProps<Props>(), {
  activeItem: 'inicio',
  accounts: () => []
});

const emit = defineEmits<{
  navigate: [itemId: string];
  avatarClick: [];
}>();

const menuItems: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: HomeIcon },
  { id: 'add', label: 'Añadir movimiento', icon: PlusIcon },
  { id: 'libro', label: 'Libro Cuentas', icon: CalculatorIcon },
  { id: 'perfil', label: 'Perfil', icon: UserIcon },
];

const currentAvatar = computed(() => {
  const activeAccount = props.accounts.find(acc => acc.isActive);
  return activeAccount?.account_picture_url || 'https://i.pravatar.cc/150?img=5';
});

const currentUserName = computed(() => {
  const activeAccount = props.accounts.find(acc => acc.isActive);
  return activeAccount?.name || 'Cuenta';
});

const handleMenuClick = (itemId: string) => {
  emit('navigate', itemId);
};

const handleAvatarClick = () => {
  emit('avatarClick');
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.aside-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background-color: $background-principal;
  border-right: 1px solid #e5e5e5;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  z-index: 200;

  // Ocultar en móvil
  @media (max-width: 767px) {
    display: none;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    padding: 0 8px;

    .logo-image {
      height: 2.5em;
      border-radius: 8px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: $color-text;
      letter-spacing: 0.5px;
    }
  }

  &__menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__footer {
    padding-top: 16px;
    
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background-color: transparent;
  border-radius: $card-border-radius;
  cursor: pointer;
  text-align: left;

  transition: transform $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;

  &:hover {
    transform: translateX(2px);
  }

  &:active {
    transform: scale(0.98);
  }

  &--active {
    .menu-item__icon {
      opacity: 1;
    }

    .menu-item__label {
      font-weight: 600;
      color: $color-text;
    }
  }

  &__icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    transition: opacity $transition-speed $transition-ease;
  }

  &__label {
    font-size: 15px;
    color: $color-text;
    font-weight: 500;
  }
}

.user-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background-color: transparent;
  border-radius: $card-border-radius;
  cursor: pointer;
  transition: transform $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;

  &:hover {
    transform: translateX(2px);
  }
  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: $color-text;
    text-align: left;
  }
}
</style>