<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/TransactionStore'
import SectionTitle from '@/components/SectionTitle.vue'
import { getCategoryIcon } from '@/components/icons/CategoryIcons'
import type { Transaction } from '@/types/models'

interface Props {
  accountId?: number
  type: 'expense' | 'income' // Para filtrar gastos o ingresos
}

const props = defineProps<Props>()

const emit = defineEmits<{
  transactionClick: [transactionId: number]
}>()

const transactionStore = useTransactionStore()
const router = useRouter()
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const showAll = ref(false)

const loadRecurringTransactions = async (accountId: number) => {
  isLoading.value = true

  try {
    // Cargar todas las transacciones de la cuenta
    const allTransactions = await transactionStore.fetchTransactions(accountId)

    // Filtrar solo las recurrentes del tipo especificado
    transactions.value = allTransactions.filter(
      (t) => t.isRecurring && t.transaction_type === props.type,
    )
  } catch (error) {
    console.error('Error cargando transacciones recurrentes:', error)
    transactions.value = []
  }

  isLoading.value = false
}

onMounted(() => {
  if (props.accountId) {
    loadRecurringTransactions(props.accountId)
  }
})

watch(
  () => props.accountId,
  (newAccountId) => {
    if (newAccountId) {
      loadRecurringTransactions(newAccountId)
    }
  },
)

// Mostrar solo las primeras 2 transacciones o todas
const displayedTransactions = computed(() => {
  return showAll.value ? transactions.value : transactions.value.slice(0, 2)
})

const canShowMore = computed(() => {
  return transactions.value.length > 2
})

const getFrequencyLabel = (transaction: Transaction): string => {
  if (!transaction.frequency) return ''

  const labels = {
    weekly: 'Semanal',
    monthly: 'Mensual',
    annual: 'Anual',
  }

  return labels[transaction.frequency] || ''
}

const formatAmount = (amount: number, type: 'expense' | 'income'): string => {
  const formatted = amount.toFixed(2).replace('.', ',')
  return type === 'expense' ? `-${formatted} €` : `+${formatted} €`
}

const handleTransactionClick = (transactionId: number) => {
  emit('transactionClick', transactionId)
  router.push(`/edit-transaction/${transactionId}`)
}

const toggleShowAll = () => {
  showAll.value = !showAll.value
}

const sectionTitle = computed(() => {
  const count = transactions.value.length
  const baseTitle = props.type === 'expense' ? 'Gastos Frecuentes' : 'Ingresos Frecuentes'
  return `| ${baseTitle} (${count})`
})
</script>

<template>
  <div v-if="!isLoading" class="recurring">
    <div class="recurring__header">
      <SectionTitle :title="sectionTitle" />
    </div>

    <div class="recurring__list">
      <div
        v-for="transaction in displayedTransactions"
        :key="transaction.transaction_id"
        class="recurring-item"
        @click="handleTransactionClick(transaction.transaction_id)"
      >
        <div class="recurring-item__icon">
          <component :is="getCategoryIcon(transaction.category)" />
        </div>

        <div class="recurring-item__info">
          <h4 class="recurring-item__title">{{ transaction.category }}</h4>
          <div class="recurring-item__details">
            <span v-if="transaction.concept">{{ transaction.concept }}</span>
            <span v-if="transaction.concept && transaction.frequency"> - </span>
            <span>{{ getFrequencyLabel(transaction) }}</span>
          </div>
        </div>

        <!-- Cantidad y flecha -->
        <div class="recurring-item__right">
          <span
            class="recurring-item__amount"
            :class="{
              'recurring-item__amount--negative': type === 'expense',
              'recurring-item__amount--positive': type === 'income',
            }"
          >
            {{ formatAmount(transaction.amount, type) }}
          </span>

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="recurring-item__arrow">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="transactions.length === 0" class="recurring__empty">
        <p>No hay {{ type === 'expense' ? 'gastos' : 'ingresos' }} frecuentes registrados</p>
      </div>

      <!-- Botón Ver más / Ver menos -->
      <button v-if="canShowMore" class="recurring__toggle-btn" @click="toggleShowAll">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            :d="showAll ? 'M19 15l-7-7-7 7' : 'M19 9l-7 7-7-7'"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ showAll ? 'Ver menos' : 'Ver más' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.recurring {
  padding: 0 $section-margin-horizontal 1.5rem;

  @media (min-width: 768px) {
    padding: 0 0 1.5rem 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $section-gap;
  }

  &__empty {
    padding: 40px 20px;
    text-align: center;
    color: $color-text-gray;

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 12px;
    margin-top: 0.5rem;
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
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.recurring-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 25px 16px;
  margin: 0 16px;
  cursor: pointer;
  transition:
    transform $transition-speed $transition-ease,
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
    background-color: #808080;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    flex-shrink: 0;
    font-size: 20px;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 4px 0;
  }

  &__details {
    font-size: 0.8rem;
    color: $color-text-gray;
    display: flex;
    align-items: center;
    gap: 4px;
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
    font-size: 16px;
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
</style>
