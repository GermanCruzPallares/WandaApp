<template>
  <div class="header-nav">
    <div class="header-nav__logo">
      <img src="../../images/OscuroReducido.png" alt="Logo" class="logo-image" />
    </div>
    
    <!-- Avatar -->
    <div class="header-nav__avatar">
      <img 
        :src="avatarSrc" 
        alt="User avatar"
        class="avatar-image"
        @click="openAccountSwitcher"
      />
    </div>

    <!-- ✅ Solo renderizar modal si currentUser existe -->
    <AccountSwitcherModal
      v-if="userStore.currentUser"
      :is-open="isAccountSwitcherOpen"
      :user-id="userStore.userId"
      :active-account-id="userStore.activeAccountId"
      :current-user="userStore.currentUser"
      @close="closeAccountSwitcher"
      @select-account="handleSelectAccount"
      @create-joint-account="handleCreateJointAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';

// ✅ Solo stores, sin props
const userStore = useUserStore();
const accountStore = useAccountStore();

// ✅ Estado local solo para el modal
const isAccountSwitcherOpen = ref(false);

// ✅ Avatar reactivo del store
const avatarSrc = computed(() => {
  const account = userStore.activeAccount;
  if (!account) return getAvatarDataUrl('personal');
  
  if (account.account_picture_url) {
    return account.account_picture_url;
  }
  
  return getAvatarDataUrl(account.account_type || 'personal');
});

// ✅ Funciones del modal
const openAccountSwitcher = () => {
  console.log('🖱️ Opening account switcher');
  isAccountSwitcherOpen.value = true;
};

const closeAccountSwitcher = () => {
  console.log('❌ Closing account switcher');
  isAccountSwitcherOpen.value = false;
};

const handleSelectAccount = (accountId: number) => {
  console.log('🔄 Account selected:', accountId);
  userStore.setActiveAccount(accountId);
  closeAccountSwitcher();
};

const handleCreateJointAccount = async (accountName: string, userEmails: string[]) => {
  console.log('➕ Creating joint account:', accountName, userEmails);
  
  try {
    const userIds: number[] = [];
    for (const email of userEmails) {
      const user = await userStore.checkUserExists(email);
      if (user) {
        userIds.push(user.user_id);
      }
    }
    
    await accountStore.createJointAccount({
      name: accountName,
      user_ids: userIds
    });
    
    await userStore.refreshAccounts();
    closeAccountSwitcher();
  } catch (error) {
    console.error('❌ Error creando cuenta conjunta:', error);
  }
};
</script>

<style scoped lang="scss">
.header-nav {
  position: fixed;  
  top: 0;            
  left: 0;           
  width: 100%;       
  z-index: 1000;     
  box-sizing: border-box;
  background-color: #e5e5e5;
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  
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