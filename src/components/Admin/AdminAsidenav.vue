<template>
  <aside class="aside-nav">

    <div class="aside-nav__logo">
      <img
        ref="logoRef"
        src="../../images/OscuroPrincipal.png"
        alt="Wanda Logo"
        class="logo-image"
        @click="isWandaMenuOpen = true"
      />
      <WandaMenuModal
        :is-open="isWandaMenuOpen"
        :anchor-el="logoRef"
        @close="isWandaMenuOpen = false"
      />
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

  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';
import WandaMenuModal from '@/components/Modals/WandaMenuModal.vue';
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
const router = useRouter();

const isAccountSwitcherOpen = ref(false);
const isWandaMenuOpen = ref(false);
const logoRef = ref<HTMLElement | null>(null);

const currentRoute = computed(() => router.currentRoute.value.path);

const avatarSrc = computed(() => {
  const account = userStore.activeAccount;
  if (!account) return getAvatarDataUrl('personal');
  if (account.account_picture_url) return account.account_picture_url;
  return getAvatarDataUrl(account.account_type || 'personal');
});

const activeAccountDisplayName = computed(() => {
  return userStore.currentUser?.name || 'Admin';
});

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/admin' },
  { id: 'add', label: 'Usuarios', icon: PlusIcon, path: '/admin/users' },
];

const openAccountSwitcher = () => { isAccountSwitcherOpen.value = true; };
const closeAccountSwitcher = () => { isAccountSwitcherOpen.value = false; };

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
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    padding: 0 8px;
    border-radius: $card-border-radius;

    .logo-image {
      height: 2.5em;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity $transition-speed $transition-ease;
      
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