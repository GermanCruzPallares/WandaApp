<script setup lang="ts">
import { ref } from 'vue';
import BottomNav from '@/components/BottomNav.vue';
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue';
import TransactionsHistoryComponent from '@/components/HomeApp/TransactionsHistoryComponent.vue';
import TopNav from '@/components/TopNav.vue';
import AsideNav from '@/components/AsideNav.vue';
import AccountSwitcherModal from '@/components/AccountSwitcherModal.vue';
import type { AccountUI } from '@/types/models';
import type { Transaction } from '@/components/HomeApp/TransactionsHistoryComponent.vue';

const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay(); 
  return day === 0 ? 6 : day - 1;
};

const currentDay = getCurrentDayOfWeek();

const objectives = ref([
  {
    id: '1',
    name: 'Coche nuevo',
    currentAmount: 7000,
    targetAmount: 10000,
    progress: 70
  },
  {
    id: '2',
    name: 'Entrada Casa',
    currentAmount: 3756,
    targetAmount: 20000,
    progress: 20
  }
]);

const isAccountModalOpen = ref(false);

// Cambiar de Account[] a AccountUI[]
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

const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};

const handleCloseModal = () => {
  isAccountModalOpen.value = false;
};

// Cambiar de string a number
const handleSelectAccount = (accountId: number) => {
  accounts.value = accounts.value.map(acc => ({
    ...acc,
    isActive: acc.account_id === accountId
  }));
  console.log('Cuenta seleccionada:', accountId);
};

const handleAddAccount = () => {
  console.log('Añadir nueva cuenta');
};

const handleAddObjective = () => {
  console.log('Añadir objetivo');
};

const handleTransactionClick = (transactionId: number) => {
  console.log('Transacción clickeada:', transactionId);
};

const handleLoadMore = () => {
  console.log('Cargar más transacciones');
};

const transactions = ref<Transaction[]>([
  {
    transaction_id: 1,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Alimentación',
    amount: 54.15,
    transaction_type: 'expense',
    concept: 'Mercadona',
    transaction_date: new Date(2026, 0, 2),
    isRecurring: true,
    frequency: 'weekly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 2)
  },
  {
    transaction_id: 2,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Alimentación',
    amount: 54.15,
    transaction_type: 'expense',
    concept: 'Mercadona',
    transaction_date: new Date(2026, 0, 2),
    isRecurring: true,
    frequency: 'weekly',
    end_date: null,
    split_type: 'none',
    last_execution_date: null
  },
  {
    transaction_id: 3,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Salario',
    amount: 2500.00,
    transaction_type: 'income',
    concept: 'Nómina mensual',
    transaction_date: new Date(2026, 0, 1),
    isRecurring: true,
    frequency: 'monthly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 1)
  },
  {
    transaction_id: 4,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Transporte',
    amount: 45.50,
    transaction_type: 'expense',
    concept: 'Gasolina',
    transaction_date: new Date(2026, 0, 1),
    isRecurring: false,
    frequency: null,
    end_date: null,
    split_type: 'none',
    last_execution_date: null
  },
  {
    transaction_id: 5,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Hogar',
    amount: 850.00,
    transaction_type: 'expense',
    concept: 'Alquiler Enero',
    transaction_date: new Date(2026, 0, 1),
    isRecurring: true,
    frequency: 'monthly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 1)
  },
  {
    transaction_id: 6,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Suscripciones',
    amount: 14.99,
    transaction_type: 'expense',
    concept: 'Netflix',
    transaction_date: new Date(2026, 0, 3),
    isRecurring: true,
    frequency: 'monthly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 3)
  },
  {
    transaction_id: 7,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Ocio',
    amount: 32.40,
    transaction_type: 'expense',
    concept: 'Cine y Palomitas',
    transaction_date: new Date(2026, 0, 4),
    isRecurring: false,
    frequency: null,
    end_date: null,
    split_type: 'none',
    last_execution_date: null
  },  
]);
  
const activeMenuItem = ref('inicio');

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  console.log('Navegando a:', itemId);
};
</script>

<template>
  <!-- Menú lateral (solo visible en tablet+) -->
  <AsideNav 
    :active-item="activeMenuItem"
    :accounts="accounts"
    @navigate="handleNavigate"
    @avatar-click="handleAvatarClick"
  />
  
  <!-- TopNav (solo visible en móvil) -->
  <TopNav 
    :accounts="accounts" 
    @avatar-click="handleAvatarClick"
    class="mobile-only"
  />
  
  <main class="home-content">
    <!-- Card siempre arriba ocupando todo el ancho -->
    <div class="home-content__header">
      <CardComponent />
    </div>

    <!-- Grid de 2 columnas en tablet+ -->
    <div class="home-content__grid">
      <!-- Columna izquierda: Balance + Objetivos -->
      <div class="home-content__left">
        <BalanceComponent
          :weekly-budget="200"
          :current-week-expenses="80"
          :today-day-of-week="currentDay"
        />
        
        <ObjectivesComponent
          :objectives="objectives"
          @add-objective="handleAddObjective"
        />
      </div>

      <!-- Columna derecha: Historial de Transacciones -->
      <div class="home-content__right">
        <TransactionsHistoryComponent
          :transactions="transactions"
          :initial-limit="5"
          :load-more-increment="10"
          @transaction-click="handleTransactionClick"
          @load-more="handleLoadMore"
        />
      </div>
    </div>
  </main>
  
  <!-- BottomNav (solo visible en móvil) -->
  <BottomNav class="mobile-only" />

  <!-- Modal de cambio de cuenta -->
  <AccountSwitcherModal
    :is-open="isAccountModalOpen"
    :accounts="accounts"
    @close="handleCloseModal"
    @select-account="handleSelectAccount"
    @add-account="handleAddAccount"
  />
</template>

<style scoped lang="scss">
.home-content {
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 80px;

  // Tablet y Desktop
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

    // Layout de 2 columnas en tablet+
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

// Ocultar en tablet+
.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>