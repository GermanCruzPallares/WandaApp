<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useAccountStore } from '@/stores/AccountStore'
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons'
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue'

// ✅ IMPORTANTE: Mantener las props aunque no las usemos directamente
// HomeView las pasa para mantener la reactividad
interface Props {
  accountId?: number
}

defineProps<Props>()

const userStore = useUserStore()
const accountStore = useAccountStore()

const isAccountSwitcherOpen = ref(false)

// ✅ Avatar reactivo desde el store
const avatarSrc = computed(() => {
  const account = userStore.activeAccount
  if (!account) return getAvatarDataUrl('personal')

  if (account.account_picture_url) {
    return account.account_picture_url
  }

  return getAvatarDataUrl(account.account_type || 'personal')
})

const openAccountSwitcher = () => {
  console.log('🖱️ Opening account switcher')
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

/**
 * ✅ Manejar creación de cuenta conjunta y activarla automáticamente
 */
const handleCreateJointAccount = async (accountName: string, userIds: number[]) => {
  console.log('➕ Creando cuenta conjunta:', accountName, userIds)

  try {
    await accountStore.createJointAccount({
      name: accountName,
      userIds: userIds,
    })

    // ✅ Refrescar cuentas y establecer la nueva como activa
    await userStore.refreshAccounts(true)

    closeAccountSwitcher()

    console.log('✅ Cuenta conjunta creada y activada')
  } catch (error) {
    console.error('❌ Error creando cuenta conjunta:', error)
    alert('Error al crear la cuenta. Por favor, intenta de nuevo.')
  }
}
</script>

<template>
  <div class="header-nav">
    <router-link to="/home" class="header-nav__logo">
      <img src="../../images/OscuroReducido.png" alt="Logo" class="logo-image" />
    </router-link>

    <!-- Avatar -->
    <div class="header-nav__avatar">
      <img :src="avatarSrc" alt="User avatar" class="avatar-image" @click="openAccountSwitcher" />
    </div>

    <!-- Modal -->
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
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.header-nav {
  position: sticky; // Use sticky instead of fixed
  top: 0;
  left: 0;
  width: 100%;
  height: $navbar-height;
  flex-shrink: 0; // Prevent navbar from shrinking in flex container
  z-index: 1000;
  box-sizing: border-box;
  background-color: #e5e5e5;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &__logo {
    .logo-image {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 8px;
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
  }
}
</style>
