<template>
  <aside class="aside-nav">
  
    <div class="aside-nav__logo">
      <img src="../../images/OscuroPrincipal.png" alt="Wanda Logo" class="logo-image" />
    </div>

    <nav class="aside-nav__menu">
      <router-link
        v-for="item in menuItems"
        :key="item.id"
        :to="item.path"
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
      </router-link>
    </nav>

    <div class="aside-nav__footer">
      <div v-if="isLoading" class="user-button user-button--loading">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text"></div>
      </div>

      <button v-else class="user-button" @click="handleAvatarClick">
        <img 
          :src="avatarSrc" 
          alt="User avatar"
          class="user-button__avatar"
        />
        <span class="user-button__name">{{ account?.name || 'Cuenta' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import type { Account } from '@/types/models';
import HomeIcon from '../icons/HomeIcon.vue';
import PlusIcon from '../icons/PlusIcon.vue';
import CalculatorIcon from '../icons/CalculatorIcon.vue';
import UserIcon from '../icons/UserIcon.vue';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

interface Props {
  activeItem?: string;
  accountId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  activeItem: 'inicio'
});

const emit = defineEmits<{
  navigate: [itemId: string];
  avatarClick: [];
  accountLoaded: [account: Account];
}>();

// ✅ Usar el store de Pinia
const accountStore = useAccountStore();

// Estado local
const account = ref<Account | null>(null);
const isLoading = ref(false);

// ✅ NUEVA LÓGICA: Obtener avatar con fallback automático
const avatarSrc = computed(() => {
  if (!account.value) return getAvatarDataUrl('personal');
  
  // Si hay imagen personalizada, usarla
  if (account.value.account_picture_url) {
    return account.value.account_picture_url;
  }
  
  // Si no, usar avatar por defecto según tipo de cuenta
  const accountType = account.value.account_type || 'personal';
  return getAvatarDataUrl(accountType);
});

const menuItems: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: HomeIcon, path: '/home' }, 
  { id: 'add', label: 'Añadir movimiento', icon: PlusIcon, path: '/transaction' },
  { id: 'libro', label: 'Libro Cuentas', icon: CalculatorIcon, path: '/book' },
  { id: 'perfil', label: 'Perfil', icon: UserIcon, path: '/profile' }, 
];


// ✅ Cargar cuenta desde el store
const loadAccount = async (accountId: number) => {
  isLoading.value = true;
  
  account.value = await accountStore.fetchAccount(accountId);
  
  if (account.value) {
    emit('accountLoaded', account.value);
  }
  
  isLoading.value = false;
};

// Cargar cuando se monta
onMounted(() => {
  if (props.accountId) {
    loadAccount(props.accountId);
  }
});

// Recargar cuando cambia la cuenta
watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    loadAccount(newAccountId);
  }
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
  text-decoration: none;
  transition: transform $transition-speed $transition-ease;

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
  transition: transform $transition-speed $transition-ease;

  &:hover {
    transform: translateX(2px);
  }

  &--loading {
    cursor: default;
    
    &:hover {
      transform: none;
    }
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

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-text {
  flex: 1;
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>