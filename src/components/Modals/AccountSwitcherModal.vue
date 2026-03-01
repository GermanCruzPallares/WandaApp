<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import type { Account, User } from '@/types/models';
import CreateJointAccountModal from './CreateJointAccountModal.vue';

interface AccountWithUsers extends Account {
  users?: User[];
}

interface Props {
  isOpen: boolean;
  userId?: number | null;
  activeAccountId?: number;
  currentUser: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  selectAccount: [accountId: number];
  createAccount: [accountName: string, userIds: number[]];
}>();

const userStore = useUserStore();
const accountStore = useAccountStore();
const router = useRouter();

const accounts = ref<Account[]>([]);
const accountsWithUsers = ref<AccountWithUsers[]>([]);
const isLoading = ref(false);
const isJointAccountModalOpen = ref(false);

const getAccountAvatar = (account: Account): string => {
  if (account.account_picture_url) return account.account_picture_url;
  return getAvatarDataUrl(account.account_type || 'personal');
};

const loadUserAccounts = async (userId: number) => {
  isLoading.value = true;
  await userStore.loadUserData(userId);
  accounts.value = userStore.accounts;
  await loadUsersForAccounts(accounts.value);
  isLoading.value = false;
};

const loadUsersForAccounts = async (accountsList: Account[]) => {
  const result: AccountWithUsers[] = [];

  for (const account of accountsList) {
    if (account.account_type === 'joint') {
      try {
        const users = await accountStore.fetchAccountMembers(account.account_id);
        result.push({ ...account, users });
      } catch {
        result.push(account);
      }
    } else {
      result.push(account);
    }
  }

  accountsWithUsers.value = result;
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.userId) {
    if (userStore.accounts.length > 0) {
      accounts.value = userStore.accounts;
      loadUsersForAccounts(accounts.value);
    } else {
      loadUserAccounts(props.userId);
    }
  }

  document.body.style.overflow = isOpen ? 'hidden' : '';
});

watch(() => props.userId, (newUserId) => {
  if (newUserId && props.isOpen) loadUserAccounts(newUserId);
});

const handleClose = () => emit('close');

const handleSelectAccount = (accountId: number) => {
  emit('selectAccount', accountId);
  handleClose();
  router.push('/home');
};

const handleAddAccount = () => { isJointAccountModalOpen.value = true; };
const handleCloseJointAccountModal = () => { isJointAccountModalOpen.value = false; };

const handleCreateJointAccount = (accountName: string, userIds: number[]) => {
  emit('createAccount', accountName, userIds);
  isJointAccountModalOpen.value = false;
  handleClose();
};

// ✅ Subtítulo de cada cuenta:
// - Personal → nombre del usuario logueado
// - Conjunta → nombres de los miembros
const getAccountSubtitle = (account: AccountWithUsers): string => {
  if (account.account_type === 'personal') {
    return props.currentUser.name;
  }
  if (account.users && account.users.length > 0) {
    return account.users.map(u => u.name).join(', ');
  }
  return '';
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <Transition name="slide">
          <div v-if="isOpen" class="modal-drawer" @click.stop>
            <div v-if="isLoading" class="loading-state">
              <p>Cargando cuentas...</p>
            </div>

            <div v-else class="accounts-list">
              <div
                v-for="account in accountsWithUsers"
                :key="account.account_id"
                class="account-item"
                :class="{ 'account-item--active': account.account_id === activeAccountId }"
                @click="handleSelectAccount(account.account_id)"
              >
                <div class="account-item__wrapper">
                  <div class="account-item__avatar">
                    <img :src="getAccountAvatar(account)" :alt="account.name" />
                  </div>

                  <div class="account-item__info">
                    <span class="account-item__name">
                      {{ account.name || (account.account_type === 'personal' ? currentUser.name : '') }}
                    </span>
                    <!-- Subtítulo solo para cuentas conjuntas -->
                    <span
                      v-if="account.account_type === 'joint'"
                      class="account-item__users"
                    >
                      {{ getAccountSubtitle(account) }}
                    </span>
                  </div>

                  <div v-if="account.account_id === activeAccountId" class="account-item__check">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                      <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="separator"></div>

              <button class="add-account-btn" @click="handleAddAccount">
                <div class="add-account-btn__wrapper">
                  <div class="add-account-btn__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="add-account-btn__text">Añadir cuenta conjunta</span>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <CreateJointAccountModal
    :is-open="isJointAccountModalOpen"
    :current-user="currentUser"
    @close="handleCloseJointAccountModal"
    @create-account="handleCreateJointAccount"
  />
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(2px);
}

.modal-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $color-white;
  border-radius: $section-border-radius $section-border-radius 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1002;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  p {
    margin: 0;
    font-size: 14px;
    color: $color-text-gray;
  }
}

.accounts-list {
  padding: 0;
}

.account-item {
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: $color-white;
  padding: 16px 0;

  &:hover { background-color: rgba(0, 0, 0, 0.02); }
  &:active { background-color: rgba(0, 0, 0, 0.05); }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 70%;
    padding: 0 20px;
    margin: 0.5em 0;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
    color: $color-text;
    display: block;
  }

  // ✅ Subtítulo siempre presente (usuario o miembros)
  &__users {
    font-size: 12px;
    color: $color-text-gray;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.separator {
  height: 1px;
  background-color: #e5e5e5;
  margin: 0;
}

.add-account-btn {
  display: flex;
  justify-content: center;
  width: 100%;
  border: none;
  background-color: $color-white;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: $color-text;
  padding: 16px 0;

  &:hover { background-color: rgba(0, 0, 0, 0.02); }
  &:active { background-color: rgba(0, 0, 0, 0.05); }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 70%;
    padding: 0 20px;
    margin: 0.5em 0;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    border: 2px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: $color-text;
  }

  &__text {
    font-size: 16px;
    font-weight: 400;
    text-align: left;
    color: $color-text;
  }
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.slide-enter-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.6, 1); }
.slide-enter-from, .slide-leave-to { transform: translateY(100%); }
.slide-enter-to { transform: translateY(0); }
</style>