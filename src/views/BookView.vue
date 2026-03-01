<template>
  <div class="book-page">
    <AsideNav
      :active-item="'libro'"
      :account-id="activeAccount?.account_id"
    />

    <TopNav
      :account-id="activeAccount?.account_id"
      class="mobile-only"
    />

    <main class="book-content">
      <!-- Título (solo desktop) -->
      <div class="book-content__title desktop-only">
        <h1>Libro de Cuentas</h1>
      </div>

      <!-- Selector de mes -->
      <div class="book-content__section">
        <MonthSelectorComponent
          v-model="selectedPeriod"
          @update:model-value="onPeriodChange"
        />
      </div>

      <!-- Tarjetas resumen -->
      <div class="book-content__section">
        <MonthlySummaryComponent
          :income="monthlyIncome"
          :expense="monthlyExpense"
          :is-loading="isLoading"
        />
      </div>

      <!-- Filtros -->
      <div class="book-content__section">
        <TransactionFilterComponent
          v-model:filters="activeFilters"
        />
      </div>

      <!-- Tabla de transacciones -->
      <div class="book-content__section">
        <TransactionTableComponent
          :transactions="monthTransactions"
          :filters="activeFilters"
          :is-loading="isLoading"
          :is-joint="activeAccount?.account_type === 'joint'"
          :members="accountMembers"
          :splits="monthSplits"
          @row-click="handleRowClick"
        />
      </div>
    </main>

    <BottomNav class="mobile-only" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import { useTransactionStore } from '@/stores/TransactionStore';
import { useTransactionSplitStore } from '@/stores/TransactionSplitStore';
import { useAccountStore } from '@/stores/AccountStore';
import TopNav from '@/components/Navs/TopNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import BottomNav from '@/components/Navs/BottomNav.vue';
import MonthSelectorComponent from '@/components/BookView/MonthlySelectorComponent.vue';
import MonthlySummaryComponent from '@/components/BookView/MonthlySummaryComponent.vue';
import TransactionFilterComponent from '@/components/BookView/TransactionFilterComponent.vue';
import type { TransactionFilters } from '@/components/BookView/TransactionFilterComponent.vue';
import TransactionTableComponent from '@/components/BookView/TransactionTableComponent.vue';
import type { Transaction, TransactionSplit, AccountUI, User } from '@/types/models';

const router = useRouter();
const userStore = useUserStore();
const transactionStore = useTransactionStore();
const splitStore = useTransactionSplitStore();
const accountStore = useAccountStore();

// ==================== ESTADO ====================

const now = new Date();
const selectedPeriod = ref({ month: now.getMonth(), year: now.getFullYear() });
const isLoading = ref(false);
const allTransactions = ref<Transaction[]>([]);
const accountMembers = ref<User[]>([]);
const allSplits = ref<TransactionSplit[]>([]);

const activeFilters = ref<TransactionFilters>({
  search: '',
  types: [],
  categories: [],
  minAmount: null,
  maxAmount: null,
});

// ==================== COMPUTED ====================

const accounts = computed<AccountUI[]>(() =>
  userStore.accounts.map(account => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId,
  }))
);

const activeAccount = computed(() => accounts.value.find(acc => acc.isActive));

// Filtrar transacciones por el mes/año seleccionado
const monthTransactions = computed<Transaction[]>(() => {
  const { month, year } = selectedPeriod.value;
  return allTransactions.value.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
});

// Splits de las transacciones visibles en el mes actual
const monthSplits = computed<TransactionSplit[]>(() => {
  const ids = new Set(monthTransactions.value.map(t => t.transaction_id));
  return allSplits.value.filter(s => ids.has(s.transaction_id));
});

const monthlyIncome = computed(() =>
  monthTransactions.value
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
);

const monthlyExpense = computed(() =>
  monthTransactions.value
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
);

// ==================== MÉTODOS ====================

const loadTransactions = async (accountId: number) => {
  isLoading.value = true;
  try {
    allTransactions.value = await transactionStore.fetchTransactions(accountId);
    // Cargar splits solo si la cuenta es conjunta
    if (activeAccount.value?.account_type === 'joint') {
      allSplits.value = await splitStore.fetchAccountSplits(accountId);
    } else {
      allSplits.value = [];
    }
  } catch (error) {
    console.error('❌ Error cargando transacciones:', error);
  } finally {
    isLoading.value = false;
  }
};

const onPeriodChange = () => {
  // Resetear filtros al cambiar de mes
  activeFilters.value = {
    search: '',
    types: [],
    categories: [],
    minAmount: null,
    maxAmount: null,
  };
};

const handleRowClick = (transactionId: number) => {
  console.log('Transacción seleccionada:', transactionId);
};

// ==================== LIFECYCLE ====================

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch {
      router.push('/login');
    }
  }

  if (activeAccount.value?.account_id) {
    loadTransactions(activeAccount.value.account_id);
  }
});

watch(
  () => activeAccount.value?.account_id,
  newId => {
    if (newId) loadTransactions(newId);
  }
);
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.book-page {
  min-height: 100vh;
  background-color: $background-principal;
}

.book-content {
  padding-top: 90px;
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 16px;
  padding-right: 16px;

  @media (min-width: 768px) {
    margin-left: $aside-nav-width;
    width: calc(100% - #{$aside-nav-width});
    padding-top: 40px;
    padding-bottom: 40px;
    padding-left: 40px;
    padding-right: 40px;
  }

  &__title {
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: $color-text;
      margin: 0 0 8px;
    }
  }

  &__section {
    width: 100%;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}

.desktop-only {
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
}
</style>