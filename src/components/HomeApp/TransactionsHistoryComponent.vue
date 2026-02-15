<template>
  <!-- ✅ Solo renderizar cuando NO está cargando -->
  <div v-if="!isLoading">
    <SectionTitle title="| Historial" />
    
    <section class="transactions-history">
      <!-- Transacciones agrupadas por fecha -->
      <div 
        v-for="group in displayedTransactions" 
        :key="group.date"
        class="transaction-group"
      >
        <div class="transaction-group__date">{{ group.formattedDate }}</div>
        
        <div class="transaction-list">
          <div
            v-for="transaction in group.transactions"
            :key="transaction.transaction_id"
            class="transaction-item"
            @click="handleTransactionClick(transaction.transaction_id)"
          >
            <!-- Icono de categoría -->
            <div class="transaction-item__icon">
              <component :is="getCategoryIcon(transaction.category)" />
            </div>
            
            <div class="transaction-item__info">
              <h4 class="transaction-item__title">{{ transaction.category }}</h4>
              <p class="transaction-item__description">{{ getDescription(transaction) }}</p>
            </div>
            
            <div class="transaction-item__right">
              <span 
                class="transaction-item__amount"
                :class="{ 
                  'transaction-item__amount--negative': transaction.transaction_type === 'expense',
                  'transaction-item__amount--positive': transaction.transaction_type === 'income'
                }"
              >
                {{ formatAmount(transaction.amount, transaction.transaction_type) }}
              </span>
              
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="transaction-item__arrow">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay transacciones -->
      <div v-if="transactions.length === 0" class="empty-state">
        <p>No hay transacciones registradas</p>
      </div>

      <!-- Botón Ver más -->
      <button 
        v-if="canLoadMore"
        class="load-more-btn"
        @click="loadMore"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Ver más
      </button>
    </section>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/TransactionStore';
import SectionTitle from '@/components/SectionTitle.vue';
import { getCategoryIcon } from '@/components/icons/CategoryIcons';
import type { Transaction } from '@/types/models';

interface TransactionGroup {
  date: string;
  formattedDate: string;
  transactions: Transaction[];
}

interface Props {
  accountId?: number;
  initialLimit?: number;
  loadMoreIncrement?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialLimit: 5,
  loadMoreIncrement: 10
});

const emit = defineEmits<{
  transactionClick: [transactionId: number];
  transactionsLoaded: [transactions: Transaction[]];
}>();

// ✅ Usar el store de Pinia
const transactionStore = useTransactionStore();

// Estado local
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const displayLimit = ref(props.initialLimit);

// ✅ Cargar transacciones desde el store
const loadTransactions = async (accountId: number) => {
  isLoading.value = true;
  
  transactions.value = await transactionStore.fetchTransactions(accountId);
  
  emit('transactionsLoaded', transactions.value);
  
  isLoading.value = false;
};

// Cargar cuando se monta
onMounted(() => {
  if (props.accountId) {
    loadTransactions(props.accountId);
  }
});

// Recargar cuando cambia la cuenta
watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    displayLimit.value = props.initialLimit;
    loadTransactions(newAccountId);
  }
});

// Convertir fecha string a Date si es necesario
const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

// Obtener la descripción completa (concepto + frecuencia si aplica)
const getDescription = (transaction: Transaction): string => {
  let description = transaction.concept || '';
  
  if (transaction.isRecurring && transaction.frequency) {
    const frequencyLabels = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual'
    };
    
    const frequencyLabel = frequencyLabels[transaction.frequency];
    description += description ? ` - ${frequencyLabel}` : frequencyLabel;
  }
  
  return description;
};

// Agrupar transacciones por fecha
const groupedTransactions = computed<TransactionGroup[]>(() => {
  const groups = new Map<string, Transaction[]>();
  
  const sortedTransactions = [...transactions.value].sort(
    (a, b) => parseDate(b.transaction_date).getTime() - parseDate(a.transaction_date).getTime()
  );
  
  sortedTransactions.forEach(transaction => {
    const transactionDate = parseDate(transaction.transaction_date);
    const dateKey = transactionDate.toISOString().split('T')[0] || '';
    
    if (!dateKey) return;
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    
    const group = groups.get(dateKey);
    if (group) {
      group.push(transaction);
    }
  });
  
  return Array.from(groups.entries()).map(([date, transactions]) => ({
    date,
    formattedDate: formatDate(new Date(date)),
    transactions
  }));
});

const displayedTransactions = computed(() => {
  let count = 0;
  const result: TransactionGroup[] = [];
  
  for (const group of groupedTransactions.value) {
    if (count >= displayLimit.value) break;
    
    const remainingSlots = displayLimit.value - count;
    const transactionsToShow = group.transactions.slice(0, remainingSlots);
    
    if (transactionsToShow.length > 0) {
      result.push({
        ...group,
        transactions: transactionsToShow
      });
      count += transactionsToShow.length;
    }
  }
  
  return result;
});

const canLoadMore = computed(() => {
  const totalTransactions = transactions.value.length;
  return displayLimit.value < totalTransactions;
});

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

const formatAmount = (amount: number, type: string): string => {
  const formatted = amount.toFixed(2).replace('.', ',');
  return type === 'expense' ? `-${formatted} €` : `+${formatted} €`;
};

const loadMore = () => {
  displayLimit.value += props.loadMoreIncrement;
};

const handleTransactionClick = (transactionId: number) => {
  emit('transactionClick', transactionId);
};
</script>

<style scoped lang="scss">
/* Estilos sin cambios */
@import '@/styles/base/variables.scss';

.transactions-history {
  padding: 0 $section-margin-horizontal 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: $color-text-gray;
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.transaction-group {
  margin-bottom: 1.5rem;

  &__date {
    font-size: 12px;
    color: $color-text-gray;
    font-weight: 500;
    margin-bottom: 0.9rem;
    padding-left: 0;
    line-height: 3em;
    border-bottom: 1px solid $color-text-gray;
  }
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 25px 16px;
  
  cursor: pointer;
  transition: transform $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateX(1px);
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: $color-text-gray;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 5px 0;
  }

  &__description {
    font-size: 0.8rem;
    color: $color-text-gray;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__amount {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;

    &--negative {
      color: $color-danger;
    }

    &--positive {
      color: $color-success;
    }
  }

  &__arrow {
    color: $color-text-gray;
    flex-shrink: 0;
  }
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  margin-top: 1rem;
  background-color: transparent;
  border: none;
  color: $color-text-gray;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color $transition-speed $transition-ease;

  svg {
    transition: transform $transition-speed $transition-ease;
  }

  &:hover {
    color: $color-text;
    
    svg {
      transform: translateY(2px);
    }
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>