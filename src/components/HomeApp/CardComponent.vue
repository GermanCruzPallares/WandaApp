<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import { useTransactionStore } from '@/stores/TransactionStore';
import { useUserStore } from '@/stores/UserStore';
import type { Account } from '@/types/models';

interface Props {
  accountId?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [];
  accountLoaded: [account: Account];
}>();

const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const userStore = useUserStore();

const account = ref<Account | null>(null);
const isLoading = ref(false);

const loadAccount = async (accountId: number) => {
  isLoading.value = true;
  
  account.value = await accountStore.fetchAccount(accountId);
  
  if (account.value) {
    emit('accountLoaded', account.value);
    await transactionStore.fetchTransactions(accountId);
  }
  
  isLoading.value = false;
};

onMounted(() => {
  if (props.accountId) loadAccount(props.accountId);
});

watch(() => props.accountId, (id) => {
  if (id) loadAccount(id);
});

const greeting = computed(() => {
  const name = userStore.currentUser?.name;
  return name ? `Hola ${name} !` : 'Hola !';
});

const formattedBalance = computed(() => {
  if (!account.value) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(account.value.amount);
});

const monthlyExpense = computed(() => {
  if (!props.accountId) return 0;
  
  const transactions = transactionStore.getTransactionsFromCache(props.accountId);
  if (!transactions) return 0;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(t => {
      const tDate = new Date(t.transaction_date);
      return t.transaction_type === 'expense' || t.transaction_type === 'saving' && 
             tDate.getMonth() === currentMonth && 
             tDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);
});

const monthlyBudget = computed(() => {
  return account.value?.monthly_budget || 0;
});

const formattedMonthlyExpense = computed(() => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monthlyExpense.value);
});

const formattedMonthlyBudget = computed(() => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monthlyBudget.value);
});

const expensePercentage = computed(() => {
  if (monthlyBudget.value === 0) return 0;
  return Math.min((monthlyExpense.value / monthlyBudget.value) * 100, 100);
});
</script>

<template>
  <div v-if="!isLoading && account !== null" class="dashboard-card">
    <div class="dashboard-card__header">
      <h2 class="dashboard-card__title">{{ greeting }}</h2>
      <RouterLink to="/home/EditAccount" class="dashboard-card__edit-btn">
        Editar
      </RouterLink>
    </div>

    <div class="dashboard-card__balance">
      {{ formattedBalance }}
    </div>
    
    <div class="dashboard-card__stats">
      <div class="stat">
        <div class="stat__labels">
          <div class="stat__label">Gasto mensual</div>
          <div class="stat__label">Presupuesto mensual</div>
        </div>
        <div class="stat__bar stat__bar--expense">
          <div 
            class="stat__bar-fill stat__bar-fill--expense" 
            :style="{ width: expensePercentage + '%' }"
          ></div>
        </div>
        <div class="stat__amounts">
          <div class="stat__amount stat__amount--expense">{{ formattedMonthlyExpense }}</div>
          <div class="stat__amount stat__amount--budget">{{ formattedMonthlyBudget }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.dashboard-card {
  background-image: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
        url(../../images/fondo.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  padding: 24px;
  margin: 16px;
  color: white;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
  
  &__edit-btn {
    background-color: rgba(255, 255, 255, 0.25);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
    text-decoration: none;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  &__loading {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  &__balance {
    font-size: 25px;
    margin-bottom: 32px;
    letter-spacing: -0.5px;
  }
  
  &__stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.stat {
  &__labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  &__label {
    font-size: 13px;
    opacity: 0.95;
    font-weight: 400;
  }
  
  &__bar {
    height: 6px;
    border-radius: 3px;
    margin-bottom: 6px;
    overflow: hidden;
    
    &--expense {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
  
  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
    
    &--expense {
      background: #F70D0D;
    }
  }
  
  &__amounts {
    display: flex;
    justify-content: space-between;
  }
  
  &__amount {
    font-size: 14px;
    font-weight: 600;
    
    &--expense {
      color: #F70D0D;
    }
    
    &--budget {
      color: #397c36;
    }
  }
}
</style>