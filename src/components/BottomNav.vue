<template>
  <nav class="navbar">
    <div class="navbar__container">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="navbar__item"
        :class="{ 'navbar__item--active': activeItem === item.id }"
        @click="handleNavClick(item.id)"
        :aria-label="item.label"
      >
        <component :is="item.icon" :is-active="activeItem === item.id" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue';
import IconHome from './icons/HomeIcon.vue';
import IconPlus from './icons/PlusIcon.vue';
import IconSquare from './icons/BookIcon.vue';
import IconUser from './icons/UserIcon.vue';

interface NavItem {
  id: string;
  label: string;
  icon: Component;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: IconHome },
  { id: 'add', label: 'Añadir', icon: IconPlus },
  { id: 'search', label: 'Buscar', icon: IconSquare },
  { id: 'profile', label: 'Perfil', icon: IconUser },
];

const activeItem = ref<string>('home');

const emit = defineEmits<{
  navigate: [id: string];
}>();

const handleNavClick = (id: string): void => {
  activeItem.value = id;
  emit('navigate', id);
  
};
</script>

<style scoped lang="scss">
.navbar {
  width: 100%;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;

  &__container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 0.75rem 1rem;
  }

  &__item {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    border-radius: 8px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &--active {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}
</style>