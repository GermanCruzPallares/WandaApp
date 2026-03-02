<template>
  <aside class="aside-nav">
    <router-link to="/home" class="aside-nav__logo">
      <img src="../../images/OscuroPrincipal.png" alt="Wanda Logo" class="logo-image" />
    </router-link>

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
        <img :src="avatarSrc" alt="User avatar" class="user-button__avatar" />
        <span class="user-button__name">
          {{ userStore.activeAccount?.name || 'Cuenta' }}
        </span>
      </button>
    </div>

    <!-- ✅ Modal integrado en el AsideNav -->
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
    <!-- ☝️ CAMBIO: @create-joint-account → @create-account -->
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useAccountStore } from '@/stores/AccountStore'
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons'
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue'
import HomeIcon from '../icons/HomeIcon.vue'
import PlusIcon from '../icons/PlusIcon.vue'
import CalculatorIcon from '../icons/CalculatorIcon.vue'
import UserIcon from '../icons/UserIcon.vue'

interface MenuItem {
  id: string
  label: string
  icon: any
  path: string
}

// ✅ Sin props, todo del store
const userStore = useUserStore()
const accountStore = useAccountStore()
const router = useRouter()

// ✅ Estado local solo para el modal
const isAccountSwitcherOpen = ref(false)

// ✅ Obtener ruta activa desde vue-router
const currentRoute = computed(() => router.currentRoute.value.path)

// ✅ Avatar reactivo del store
const avatarSrc = computed(() => {
  const account = userStore.activeAccount
  if (!account) return getAvatarDataUrl('personal')

  if (account.account_picture_url) {
    return account.account_picture_url
  }

  return getAvatarDataUrl(account.account_type || 'personal')
})

const menuItems: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: HomeIcon, path: '/home' },
  { id: 'add', label: 'Añadir movimiento', icon: PlusIcon, path: '/transaction' },
  { id: 'libro', label: 'Libro Cuentas', icon: CalculatorIcon, path: '/book' },
  { id: 'perfil', label: 'Perfil', icon: UserIcon, path: '/profile' },
]

// ✅ Funciones del modal
const openAccountSwitcher = () => {
  console.log('🖱️ Opening account switcher from AsideNav')
  isAccountSwitcherOpen.value = true
}

const closeAccountSwitcher = () => {
  console.log('❌ Closing account switcher')
  isAccountSwitcherOpen.value = false
}

const handleSelectAccount = (accountId: number) => {
  console.log('🔄 Account selected:', accountId)
  userStore.setActiveAccount(accountId)
  closeAccountSwitcher()
}

// ✅ CORREGIDO: Recibir userIds (números) en lugar de userEmails
const handleCreateJointAccount = async (accountName: string, userIds: number[]) => {
  console.log('4️⃣ AsideNav recibió:', accountName, userIds)

  try {
    await accountStore.createJointAccount({
      name: accountName,
      userIds: userIds, // ✅ Ya son números
    })

    await userStore.refreshAccounts()
    closeAccountSwitcher()
  } catch (error) {
    console.error('❌ Error creando cuenta conjunta:', error)
    alert('Error al crear la cuenta. Por favor, intenta de nuevo.')
  }
}
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
    text-decoration: none;
    transition: opacity $transition-speed $transition-ease;

    &:hover {
      opacity: 0.8;
    }

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
