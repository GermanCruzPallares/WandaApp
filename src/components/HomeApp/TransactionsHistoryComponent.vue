<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/TransactionStore'
import SectionTitle from '@/components/SectionTitle.vue'
import { getCategoryIcon } from '@/components/icons/CategoryIcons'
import type { Transaction } from '@/types/models'

interface TransactionGroup {
  date: string
  formattedDate: string
  transactions: Transaction[]
}

interface Props {
  accountId?: number
  initialLimit?: number
  loadMoreIncrement?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialLimit: 5,
  loadMoreIncrement: 10,
})

const emit = defineEmits<{
  transactionClick: [transactionId: number]
  transactionsLoaded: [transactions: Transaction[]]
}>()

// ✅ Usar el store de Pinia y Router
const transactionStore = useTransactionStore()
const router = useRouter()

// Estado local
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const displayLimit = ref(props.initialLimit)

// ✅ Cargar transacciones desde el store
const loadTransactions = async (accountId: number) => {
  isLoading.value = true

  transactions.value = await transactionStore.fetchTransactions(accountId)

  emit('transactionsLoaded', transactions.value)

  isLoading.value = false
}

// Cargar cuando se monta
onMounted(() => {
  if (props.accountId) {
    loadTransactions(props.accountId)
  }
})

// Recargar cuando cambia la cuenta
watch(
  () => props.accountId,
  (newAccountId) => {
    if (newAccountId) {
      displayLimit.value = props.initialLimit
      loadTransactions(newAccountId)
    }
  },
)

// Convertir fecha string a Date si es necesario
const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date
}

// Obtener la descripción completa (concepto + frecuencia si aplica)
const getDescription = (transaction: Transaction): string => {
  let description = transaction.concept || ''

  if (transaction.isRecurring && transaction.frequency) {
    const frequencyLabels = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      annual: 'Anual',
    }

    const frequencyLabel = frequencyLabels[transaction.frequency]
    description += description ? ` - ${frequencyLabel}` : frequencyLabel
  }

  return description
}

// Agrupar transacciones por fecha
const groupedTransactions = computed<TransactionGroup[]>(() => {
  const groups = new Map<string, Transaction[]>()

  const sortedTransactions = [...transactions.value].sort(
    (a, b) => parseDate(b.transaction_date).getTime() - parseDate(a.transaction_date).getTime(),
  )

  sortedTransactions.forEach((transaction) => {
    const transactionDate = parseDate(transaction.transaction_date)
    const dateKey = transactionDate.toISOString().split('T')[0] || ''

    if (!dateKey) return

    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }

    const group = groups.get(dateKey)
    if (group) {
      group.push(transaction)
    }
  })

  return Array.from(groups.entries()).map(([date, transactions]) => ({
    date,
    formattedDate: formatDate(new Date(date)),
    transactions,
  }))
})

const displayedTransactions = computed(() => {
  let count = 0
  const result: TransactionGroup[] = []

  for (const group of groupedTransactions.value) {
    if (count >= displayLimit.value) break

    const remainingSlots = displayLimit.value - count
    const transactionsToShow = group.transactions.slice(0, remainingSlots)

    if (transactionsToShow.length > 0) {
      result.push({
        ...group,
        transactions: transactionsToShow,
      })
      count += transactionsToShow.length
    }
  }

  return result
})

const canLoadMore = computed(() => {
  const totalTransactions = transactions.value.length
  return displayLimit.value < totalTransactions
})

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

const formatAmount = (amount: number, type: string): string => {
  const formatted = amount.toFixed(2).replace('.', ',')
  return type === 'expense' ? `-${formatted} €` : `+${formatted} €`
}

const loadMore = () => {
  displayLimit.value += props.loadMoreIncrement
}

const handleTransactionClick = (transactionId: number) => {
  emit('transactionClick', transactionId)
  router.push(`/edit-transaction/${transactionId}`)
}
</script>

<template>
  <div v-if="!isLoading">
    <SectionTitle title="| Historial" />

    <section class="transactions-history">
      <div
        v-for="group in displayedTransactions"
        :key="group.date"
        class="transaction-group"
      >
        <div class="transaction-group__date">{{ group.formattedDate }}</div>

        <div class="transaction-list">
          <TransactionCard
            v-for="transaction in group.transactions"
            :key="transaction.transaction_id"
            :transaction="transaction"
            :is-joint="isJoint"
            :members="members"
            :splits="getSplitsForTransaction(transaction.transaction_id)"
            @click="handleTransactionClick"
          />
        </div>
      </div>

      <div v-if="transactions.length === 0" class="empty-state">
        <p>No hay transacciones registradas</p>
      </div>

      <button v-if="canLoadMore" class="load-more-btn" @click="loadMore">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 9l-7 7-7-7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Ver más
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/TransactionStore';
import { useTransactionSplitStore } from '@/stores/TransactionSplitStore';
import { useAccountStore } from '@/stores/AccountStore';
import SectionTitle from '@/components/SectionTitle.vue';
import TransactionCard from '@/components/HomeApp/TransactionCard.vue';
import type { Transaction, TransactionSplit, User } from '@/types/models';

// ==================== TIPOS ====================

interface TransactionGroup {
  date: string;
  formattedDate: string;
  transactions: Transaction[];
}

// ==================== PROPS ====================

interface Props {
  accountId?: number;
  accountType?: 'personal' | 'joint';
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

// ==================== STORES ====================

const transactionStore = useTransactionStore();
const splitStore = useTransactionSplitStore();
const accountStore = useAccountStore();

// ==================== ESTADO ====================

const transactions = ref<Transaction[]>([]);
const members = ref<User[]>([]);
const splits = ref<TransactionSplit[]>([]);
const isLoading = ref(false);
const displayLimit = ref(props.initialLimit);

const isJoint = computed(() => props.accountType === 'joint');

// ==================== CARGA ====================

const loadTransactions = async (accountId: number) => {
  isLoading.value = true;
  transactions.value = await transactionStore.fetchTransactions(accountId);
  emit('transactionsLoaded', transactions.value);
  isLoading.value = false;
};

const loadMembers = async (accountId: number) => {
  if (!isJoint.value) return;
  members.value = await accountStore.fetchAccountMembers(accountId);
};

const loadSplits = async (accountId: number) => {
  if (!isJoint.value) return;
  splits.value = await splitStore.fetchAccountSplits(accountId);
};

onMounted(() => {
  if (props.accountId) {
    loadTransactions(props.accountId);
    loadMembers(props.accountId);
    loadSplits(props.accountId);
  }
});

watch(() => props.accountId, (newId) => {
  if (newId) {
    displayLimit.value = props.initialLimit;
    loadTransactions(newId);
    loadMembers(newId);
    loadSplits(newId);
  }
});

watch(() => props.accountType, () => {
  if (props.accountId) {
    loadMembers(props.accountId);
    loadSplits(props.accountId);
  }
});

// ==================== SPLITS ====================

const getSplitsForTransaction = (transactionId: number): TransactionSplit[] => {
  return splits.value.filter(s => s.transaction_id === transactionId);
};

// ==================== HELPERS ====================

const parseDate = (date: Date | string): Date =>
  typeof date === 'string' ? new Date(date) : date;

const groupedTransactions = computed<TransactionGroup[]>(() => {
  const groups = new Map<string, Transaction[]>();

  const sorted = [...transactions.value].sort(
  (a, b) => {
    const dateDiff = parseDate(b.transaction_date).getTime() - parseDate(a.transaction_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.transaction_id - a.transaction_id;
  }
);

  sorted.forEach(t => {
    const dateKey = parseDate(t.transaction_date).toISOString().split('T')[0] ?? '';
    if (!dateKey) return;
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(t);
  });

  return Array.from(groups.entries()).map(([date, txs]) => ({
    date,
    formattedDate: formatDate(new Date(date)),
    transactions: txs
  }));
});

const displayedTransactions = computed(() => {
  let count = 0;
  const result: TransactionGroup[] = [];

  for (const group of groupedTransactions.value) {
    if (count >= displayLimit.value) break;
    const slots = displayLimit.value - count;
    const toShow = group.transactions.slice(0, slots);
    if (toShow.length > 0) {
      result.push({ ...group, transactions: toShow });
      count += toShow.length;
    }
  }
  return result;
});

const canLoadMore = computed(() => displayLimit.value < transactions.value.length);

const formatDate = (date: Date): string => {
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${date.getDate().toString().padStart(2,'0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const loadMore = () => { displayLimit.value += props.loadMoreIncrement; };
const handleTransactionClick = (id: number) => emit('transactionClick', id);
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.transactions-history {
  padding: 0 $section-margin-horizontal 1.5rem;
}

.transaction-group {
  margin-bottom: 1.5rem;

  &__date {
    font-size: 12px;
    color: $color-text-gray;
    font-weight: 500;
    margin-bottom: 0.9rem;
    line-height: 3em;
    border-bottom: 1px solid $color-text-gray;
  }
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: $color-text-gray;
  p { margin: 0; font-size: 14px; }
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

  svg { transition: transform $transition-speed $transition-ease; }

  &:hover {
    color: $color-text;
    svg { transform: translateY(2px); }
  }
  &:active { transform: scale(0.98); }
}
</style>
