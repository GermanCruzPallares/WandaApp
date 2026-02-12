<script setup lang="ts">
import { ref, computed } from 'vue';
import BottomNav from '@/components/Navs/BottomNav.vue';
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue';
import TransactionsHistoryComponent from '@/components/HomeApp/TransactionsHistoryComponent.vue';
import TopNav from '@/components/Navs/TopNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';
import type { AccountUI, User, Transaction, Account } from '@/types/models';

const currentUser = ref<User>({
  user_id: 1,
  name: 'Clara',
  email: 'clara@wandaapp.com'
});

const accounts = ref<AccountUI[]>([
  {
    account_id: 1,
    name: 'Clara',
    account_type: 'personal',
    amount: 13789.37,
    weekly_budget: 200,
    monthly_budget: 2000,
    account_picture_url: 'https://i.pravatar.cc/150?img=5',
    creation_date: new Date(),
    isActive: true
  }
]);

const activeAccount = computed(() => {
  return accounts.value.find(acc => acc.isActive);
});


const isAccountModalOpen = ref(false);

const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};

const handleCloseModal = () => {
  isAccountModalOpen.value = false;
};

const handleSelectAccount = (accountId: number) => {
  accounts.value = accounts.value.map(acc => ({
    ...acc,
    isActive: acc.account_id === accountId
  }));
  console.log('🔄 Cuenta seleccionada:', accountId);
};

const handleCreateJointAccount = (accountName: string, userEmails: string[]) => {
  console.log('Crear cuenta conjunta:', accountName, userEmails);
  const newAccount: AccountUI = {
    account_id: accounts.value.length + 1,
    name: accountName,
    account_type: 'joint',
    amount: 0,
    weekly_budget: 0,
    monthly_budget: 0,
    account_picture_url: `https://i.pravatar.cc/150?img=${accounts.value.length + 1}`,
    creation_date: new Date(),
    isActive: false
  };
  accounts.value.push(newAccount);
};

const handleEditCard = () => {
  console.log('Editar tarjeta');
};

const handleAddObjective = () => {
  console.log('Añadir objetivo');
};

const handleTransactionClick = (transactionId: number) => {
  console.log('Transacción clickeada:', transactionId);
};

const activeMenuItem = ref('inicio');

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  console.log('Navegando a:', itemId);
};
</script>

<template>
<AsideNav 
    :active-item="activeMenuItem"
    :account-id="activeAccount?.account_id"
    @navigate="handleNavigate"
    @avatar-click="handleAvatarClick"
  />
  
<TopNav 
    :account-id="activeAccount?.account_id"
    @avatar-click="handleAvatarClick"
    class="mobile-only"
  />
  
  <main class="home-content">
    <div class="home-content__header">
      <CardComponent 
        :account-id="activeAccount?.account_id"
        :user-name="currentUser.name"
        @edit="handleEditCard"
      />
    </div>

    <div class="home-content__grid">
      <div class="home-content__left">
  
        <BalanceComponent
          :account-id="activeAccount?.account_id"
        />
        
        <ObjectivesComponent
          @add-objective="handleAddObjective"
        />
      </div>

      <div class="home-content__right">
        <TransactionsHistoryComponent
          :account-id="activeAccount?.account_id"
          :initial-limit="5"
          :load-more-increment="10"
          @transaction-click="handleTransactionClick"
        />
      </div>
    </div>
  </main>
  
  <BottomNav class="mobile-only" />

  <AccountSwitcherModal
    :is-open="isAccountModalOpen"
    :accounts="accounts"
    :current-user="currentUser"
    @close="handleCloseModal"
    @select-account="handleSelectAccount"
    @create-joint-account="handleCreateJointAccount"
  />
</template>

<style scoped lang="scss">
.home-content {
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 80px;

  @media (min-width: 768px) {
    margin-left: 240px;
    padding: 40px 20px;
    max-width: calc(100vw - 240px);
  }

  &__header {
    width: 100%;
    margin-bottom: 20px;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 0;

    @media (min-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }
  }

  &__left,
  &__right {
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (min-width: 768px) {
      gap: 20px;
    }
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>