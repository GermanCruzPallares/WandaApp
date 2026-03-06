<template>
  <div class="transaction-table">
    <div v-if="isLoading" class="table-skeleton">
      <div class="table-skeleton__header"></div>
      <div v-for="i in 6" :key="i" class="table-skeleton__row"></div>
    </div>

    <template v-else>
      <div class="table-wrapper">
        <div class="table-header">
          <span class="col-cat">Cat.</span>
          <span class="col-concept">Concepto</span>
          <span class="col-date">Fecha</span>
          <span class="col-amount">Importe</span>
        </div>

        <div class="table-body">
          <div
            v-for="transaction in filteredTransactions"
            :key="transaction.transaction_id"
            class="table-row"
            @click="$emit('rowClick', transaction)"
          >
            <div class="col-cat">
              <div class="icon-wrap">
                <div class="category-icon">
                  <component :is="getCategoryIcon(transaction.category) || getCategoryIcon('Otros')" />
                </div>

                <div v-if="isJoint" class="user-avatars">
                  <template v-if="transaction.split_type === 'divided'">
                    <img
                      v-for="split in getSplits(transaction.transaction_id)"
                      :key="split.user_id"
                      :src="getMemberAvatar(split.user_id)"
                      :alt="getMemberName(split.user_id)"
                      class="user-avatar"
                    />
                    <img
                      :src="getMemberAvatar(transaction.user_id)"
                      :alt="getMemberName(transaction.user_id)"
                      class="user-avatar"
                    />
                  </template>

                  <img
                    v-else
                    :src="getMemberAvatar(transaction.user_id)"
                    :alt="getMemberName(transaction.user_id)"
                    class="user-avatar"
                  />
                </div>
              </div>
            </div>

            <div class="col-concept">
              <div class="concept-stack">
                <div class="concept-top">
                  <span class="concept-name">
                    {{ transaction.concept || transaction.category || '—' }}
                  </span>
                  <span v-if="transaction.isRecurring" class="recurring-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                <span v-if="isJoint" class="concept-author">
                  <template v-if="transaction.split_type === 'divided'">
                    {{ getDividedParticipantNames(transaction) }}
                  </template>
                  <template v-else>
                    {{ getMemberName(transaction.user_id) }}
                  </template>
                </span>
              </div>
            </div>

            <div class="col-date">
              <span class="date-text">{{ formatDate(transaction.transaction_date) }}</span>
            </div>

            <div class="col-amount">
              <span
                class="amount-text"
                :class="{
                  'amount-text--expense':
                    transaction.transaction_type === 'expense' ||
                    transaction.transaction_type === 'saving',
                  'amount-text--income': transaction.transaction_type === 'income',
                }"
              >
                {{ formatAmount(transaction.amount, transaction.transaction_type) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.4" />
            <path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
          </svg>
          <p v-if="hasFilters">No hay transacciones con los filtros aplicados</p>
          <p v-else>No hay transacciones en este mes</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCategoryIcon } from '@/components/icons/CategoryIcons'
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons'
import type { Transaction, TransactionSplit, User } from '@/types/models'
import type { TransactionFilters } from './TransactionFilterComponent.vue'

const props = defineProps<{
  transactions: Transaction[]
  filters: TransactionFilters
  isLoading?: boolean
  isJoint?: boolean
  members?: User[]
  splits?: TransactionSplit[]
  memberAvatars?: Map<number, string>
}>()

defineEmits<{
  rowClick: [transaction: Transaction]
}>()

// ── Normaliza igual que getCategoryIcon (sin acentos, lowercase) ──────────────
const normalize = (str: string) =>
  str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// ==================== HELPERS ====================

const getMemberAvatar = (userId: number): string =>
  props.memberAvatars?.get(userId) || getAvatarDataUrl('personal')

const getMemberName = (userId: number): string =>
  props.members?.find((m) => m.user_id === userId)?.name ?? ''

const getSplits = (transactionId: number): TransactionSplit[] =>
  props.splits?.filter((s) => s.transaction_id === transactionId) ?? []

const getDividedParticipantNames = (transaction: Transaction): string => {
  const debtorIds = getSplits(transaction.transaction_id).map((s) => s.user_id)
  const allIds = [...new Set([transaction.user_id, ...debtorIds])]
  return allIds.map((id) => getMemberName(id)).filter(Boolean).join(', ')
}

// ==================== FILTERING ====================

const filteredTransactions = computed(() => {
  let result = [...props.transactions]

  // Búsqueda texto
  if (props.filters.search.trim()) {
    const q = props.filters.search.toLowerCase().trim()
    result = result.filter(
      (t) => t.concept?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q),
    )
  }

  // Tipo
  if (props.filters.types.length > 0) {
    result = result.filter((t) => props.filters.types.includes(t.transaction_type))
  }

  // Categoría — normaliza ambos lados para ignorar acentos y mayúsculas
  if (props.filters.categories.length > 0) {
    const normalizedSelected = props.filters.categories.map(normalize)
    result = result.filter((t) =>
      normalizedSelected.includes(normalize(t.category ?? ''))
    )
  }

  // Importe mínimo
  if (props.filters.minAmount !== null) {
    result = result.filter((t) => t.amount >= (props.filters.minAmount ?? 0))
  }

  // Importe máximo
  if (props.filters.maxAmount !== null) {
    result = result.filter((t) => t.amount <= (props.filters.maxAmount ?? Infinity))
  }

  // Recurrencia
  if (props.filters.onlyRecurring === true) {
    result = result.filter((t) => t.isRecurring)
  } else if (props.filters.onlyRecurring === false) {
    result = result.filter((t) => !t.isRecurring)
  }

  return result.sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
  )
})

const hasFilters = computed(() => {
  const f = props.filters
  return (
    f.search.length > 0 ||
    f.types.length > 0 ||
    f.categories.length > 0 ||
    f.minAmount !== null ||
    f.maxAmount !== null ||
    f.onlyRecurring !== null
  )
})

// ==================== FORMATTERS ====================

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

const formatAmount = (amount: number, type: string): string => {
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  if (type === 'expense' || type === 'saving') return `-${formatted} €`
  if (type === 'income') return `+${formatted} €`
  return `${formatted} €`
}
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.transaction-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.table-wrapper {
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 56px 1fr 70px 100px;
  align-items: center;
  padding: 10px 20px;
  background-color: $section-bg-primary;
  border-bottom: 1px solid #ffffff;

  span {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: $color-text-gray;
  }

  .col-amount { text-align: right; }
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 56px 1fr 70px 100px;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color $transition-speed $transition-ease;

  &:last-child { border-bottom: none; }
  &:hover { background-color: rgba(0, 0, 0, 0.03); }
  &:active { background-color: rgba(0, 0, 0, 0.03); }
}

.col-cat { display: flex; align-items: center; }

.icon-wrap {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.category-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: $section-bg-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text;

  svg { width: 16px; height: 16px; }
}

.user-avatars {
  position: absolute;
  bottom: -4px;
  right: -6px;
  display: flex;
  flex-direction: row-reverse;
}

.user-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $color-white;
  margin-left: -5px;

  &:last-child { margin-left: 0; }
}

.col-concept {
  display: flex;
  align-items: center;
  min-width: 0;
}

.concept-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.concept-top {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.concept-name {
  font-size: 14px;
  font-weight: 600;
  color: $color-text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.concept-author {
  font-size: 11px;
  color: $color-text-gray;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recurring-badge {
  display: flex;
  align-items: center;
  color: $color-text-gray;
  flex-shrink: 0;
}

.col-date { display: flex; align-items: center; }

.date-text {
  font-size: 13px;
  color: $color-text-gray;
  font-weight: 500;
}

.col-amount {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.amount-text {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;

  &--expense { color: $color-danger; }
  &--income { color: $color-success; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: $color-text-gray;
  gap: 12px;
  text-align: center;

  p { font-size: 14px; margin: 0; }
}

.table-skeleton {
  background-color: $color-white;
  border: 1px solid #e8e8e8;
  border-radius: $card-border-radius;
  overflow: hidden;

  &__header {
    height: 38px;
    background-color: $section-bg-primary;
    border-bottom: 1px solid #e0e0e0;
  }

  &__row {
    height: 60px;
    border-bottom: 1px solid #f5f5f5;
    background: linear-gradient(90deg, #f5f5f5 25%, #eeeeee 50%, #f5f5f5 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;

    &:last-child { border-bottom: none; }
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>