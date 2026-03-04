<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useAccountStore } from '@/stores/AccountStore'
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons'
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue'
import WandaMenuModal from '@/components/Modals/WandaMenuModal.vue'
import { authService } from '@/services/authService'

interface Props {
  accountId?: number
}

defineProps<Props>()

const userStore = useUserStore()
const accountStore = useAccountStore()
const router = useRouter()

const isAccountSwitcherOpen = ref(false)
const isWandaMenuOpen = ref(false)
const logoRef = ref<HTMLElement | null>(null)

const avatarSrc = computed(() => {
  const account = userStore.activeAccount
  if (!account) return getAvatarDataUrl('personal')
  if (account.account_picture_url) return account.account_picture_url
  return getAvatarDataUrl(account.account_type || 'personal')
})

const openAccountSwitcher = () => {
  if (!authService.isAdmin()) {
    isAccountSwitcherOpen.value = true
  }
}

const isAdmin = computed(() => authService.isAdmin())

const closeAccountSwitcher = () => {
  isAccountSwitcherOpen.value = false
}

const handleSelectAccount = (accountId: number) => {
  userStore.setActiveAccount(accountId)
  closeAccountSwitcher()
}

const handleCreateJointAccount = async (accountName: string, userIds: number[]) => {
  try {
    await accountStore.createJointAccount({ name: accountName, userIds })
    await userStore.refreshAccounts(true)
    closeAccountSwitcher()
    router.push('/home')
  } catch (error) {
    console.error('Error creando cuenta conjunta:', error)
    alert('Error al crear la cuenta. Por favor, intenta de nuevo.')
  }
}
</script>

<template>
  <div class="header-nav">
    <div class="header-nav__logo">
      <img
        ref="logoRef"
        src="../../images/OscuroReducido.png"
        alt="Logo"
        class="logo-image"
        @click="isWandaMenuOpen = true"
      />
      <WandaMenuModal
        :is-open="isWandaMenuOpen"
        :anchor-el="logoRef"
        @close="isWandaMenuOpen = false"
      />
    </div>

    <div class="header-nav__avatar" :class="{ 'header-nav__avatar--no-action': isAdmin }">
      <img :src="avatarSrc" alt="User avatar" class="avatar-image" @click="openAccountSwitcher" />
    </div>

    <AccountSwitcherModal
      v-if="userStore.currentUser && !isAdmin"
      :is-open="isAccountSwitcherOpen"
      :user-id="userStore.userId"
      :active-account-id="userStore.activeAccountId"
      :current-user="userStore.currentUser"
      @close="closeAccountSwitcher"
      @select-account="handleSelectAccount"
      @create-account="handleCreateJointAccount"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.header-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
  background-color: #e5e5e5;
  padding: calc(16px + env(safe-area-inset-top)) 20px 16px 20px;
  min-height: calc(85px + env(safe-area-inset-top));
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  &__logo {
    position: relative;

    .logo-image {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
  }

  &__avatar {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    .avatar-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &--no-action {
      cursor: default;

      &:hover {
        transform: none;
      }

      &:active {
        transform: none;
      }
    }
  }
}
</style>
