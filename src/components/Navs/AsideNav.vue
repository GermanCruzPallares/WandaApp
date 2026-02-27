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
        :class="{ 'menu-item--active': currentRoute === item.path }"
      >
        <component 
          :is="item.icon" 
          :is-active="currentRoute === item.path"
          class="menu-item__icon" 
        />
        <span class="menu-item__label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="aside-nav__footer">
      <button class="user-button" @click="openAccountSwitcher">
        <img 
          :src="avatarSrc" 
          alt="User avatar"
          class="user-button__avatar"
        />
        <span class="user-button__name">{{ activeAccountDisplayName }}</span>
      </button>
    </div>

    <AccountSwitcherModal
      v-if="userStore.currentUser"
      :is-open="isAccountSwitcherOpen"
      :user-id="userStore.userId"
      :active-account-id="userStore.activeAccountId"
      :current-user="userStore.currentUser"
      @close="closeAccountSwitcher"
      @select-account="handleSelectAccount"
      @create-account="handleCreateJointAccount"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';
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

const userStore = useUserStore();
const accountStore = useAccountStore();
const router = useRouter();

const isAccountSwitcherOpen = ref(false);

const currentRoute = computed(() => router.currentRoute.value.path);

const avatarSrc = computed(() => {
  const account = userStore.activeAccount;
  if (!account) return getAvatarDataUrl('personal');
  if (account.account_picture_url) return account.account_picture_url;
  return getAvatarDataUrl(account.account_type || 'personal');
});

// ✅ Nombre a mostrar en el botón de cuenta:
// - Personal con name vacío → nombre del usuario
// - Cualquier otro → nombre de la cuenta
const activeAccountDisplayName = computed(() => {
  const account = userStore.activeAccount;
  if (!account) return 'Cuenta';
  if (account.account_type === 'personal' && !account.name) {
    return userStore.currentUser?.name || 'Cuenta';
  }
  return account.name || 'Cuenta';
});

const menuItems: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: HomeIcon, path: '/home' }, 
  { id: 'add', label: 'Añadir movimiento', icon: PlusIcon, path: '/transaction' },
  { id: 'libro', label: 'Libro Cuentas', icon: CalculatorIcon, path: '/book' },
  { id: 'perfil', label: 'Perfil', icon: UserIcon, path: '/profile' }, 
];

const openAccountSwitcher = () => { isAccountSwitcherOpen.value = true; };
const closeAccountSwitcher = () => { isAccountSwitcherOpen.value = false; };

const handleSelectAccount = (accountId: number) => {
  userStore.setActiveAccount(accountId);
  closeAccountSwitcher();
};

const handleCreateJointAccount = async (accountName: string, userIds: number[]) => {
  try {
    await accountStore.createJointAccount({ name: accountName, userIds });
    await userStore.refreshAccounts();
    closeAccountSwitcher();
  } catch (error) {
    console.error('❌ Error creando cuenta conjunta:', error);
    alert('Error al crear la cuenta. Por favor, intenta de nuevo.');
  }
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

  &:hover { transform: translateX(2px); }
  &:active { transform: scale(0.98); }

  &--active {
    .menu-item__icon { opacity: 1; }
    .menu-item__label { font-weight: 600; color: $color-text; }
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

  &:hover { transform: translateX(2px); }

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