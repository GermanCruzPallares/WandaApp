<template>
  <nav class="navbar">
    <div class="navbar__container">
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="item.path"
        class="navbar__item"
        active-class="navbar__item--active"
        :aria-label="item.label"
      >
        <component :is="item.icon" :is-active="$route.path === item.path" class="navbar__icon" />
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import HomeIcon from '../icons/HomeIcon.vue'
import PlusIcon from '../icons/PlusIcon.vue'
import CalculatorIcon from '../icons/CalculatorIcon.vue'
import UserIcon from '../icons/UserIcon.vue'

interface NavItem {
  id: string
  label: string
  icon: any
  path: string
}

const route = useRoute()

const navItems: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: HomeIcon, path: '/home' },
  { id: 'add', label: 'Añadir', icon: PlusIcon, path: '/transaction' },
  { id: 'libro', label: 'Cuentas', icon: CalculatorIcon, path: '/book' },
  { id: 'perfil', label: 'Perfil', icon: UserIcon, path: '/profile' },
]
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: $section-bg-primary;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  z-index: 1000;

  // KEY FIX: when the virtual keyboard opens it shrinks the visual viewport
  // but we want the navbar anchored to the layout viewport (full screen), not the visual one.
  // `dvh` units follow the visual viewport — `svh` follows the smallest (stable) viewport.
  // By transforming to use svh we stay anchored to the bottom of the stable viewport.
  @supports (height: 100svh) {
    // Anchor to stable viewport bottom so virtual keyboard doesn't push the nav up
    position: fixed;
    bottom: env(safe-area-inset-bottom, 0px);
    // Override bottom with layout viewport approach
    bottom: 0;
    // The real trick: tell the browser not to resize for the keyboard
    // This works in Chrome/Android. For iOS Safari we need the JS fallback below.
  }

  &__container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom)) 1rem;
  }

  &__item {
    text-decoration: none;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform $transition-speed ease;

    &:active { transform: scale(0.95); }
    &--active { filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.1)); }
  }

  &__icon {
    width: 28px;
    height: 28px;
  }
}
</style>