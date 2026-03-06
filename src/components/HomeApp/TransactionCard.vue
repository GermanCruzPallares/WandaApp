<template>
  <div class="transaction-card" @click="$emit('click', transaction)">
    <div class="transaction-card__icon-wrap">
      <div class="transaction-card__icon">
        <component :is="getCategoryIcon(transaction.category)" />
      </div>

      <div v-if="isJoint" class="transaction-card__user-avatars">
        <template v-if="transaction.split_type === 'divided'">
          <img
            v-for="split in splits"
            :key="split.user_id"
            :src="getMemberAvatar(split.user_id)"
            :alt="getMemberName(split.user_id)"
            class="transaction-card__user-avatar"
          />

          <img
            :src="getMemberAvatar(transaction.user_id)"
            :alt="getMemberName(transaction.user_id)"
            class="transaction-card__user-avatar"
          />
        </template>

        <img
          v-else
          :src="getMemberAvatar(transaction.user_id)"
          :alt="getMemberName(transaction.user_id)"
          class="transaction-card__user-avatar"
        />
      </div>
    </div>

    <div class="transaction-card__info">
      <h4 class="transaction-card__title">{{ transaction.category }}</h4>
      <p class="transaction-card__description">{{ description }}</p>

      <p v-if="isJoint" class="transaction-card__user-name">
        <template v-if="transaction.split_type === 'divided'">
          {{ dividedParticipantNames }}
        </template>
        <template v-else>
          {{ getMemberName(transaction.user_id) }}
        </template>
      </p>
    </div>

    <div class="transaction-card__right">
      <span
        class="transaction-card__amount"
        :class="{
          'transaction-card__amount--negative':
            transaction.transaction_type === 'expense' || transaction.transaction_type === 'saving',
          'transaction-card__amount--positive': transaction.transaction_type === 'income',
        }"
      >
        {{ formattedAmount }}
      </span>

      <svg v-if="!isMirror" width="16" height="16" viewBox="0 0 24 24" fill="none" class="transaction-card__arrow">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCategoryIcon } from '@/components/icons/CategoryIcons'
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons'
import type { Transaction, TransactionSplit, User } from '@/types/models'

interface Props {
  transaction: Transaction
  isJoint?: boolean
  members?: User[]
  splits?: TransactionSplit[]
  memberAvatars?: Map<number, string>  
}

const props = withDefaults(defineProps<Props>(), {
  isJoint: false,
  members: () => [],
  splits: () => [],
  memberAvatars: () => new Map(),
})

defineEmits<{
  click: [transaction: Transaction]
}>()

// ==================== HELPERS ====================

const getMemberAvatar = (userId: number): string => {
  return props.memberAvatars.get(userId) || getAvatarDataUrl('personal')
}

const getMemberName = (userId: number): string => {
  return props.members.find((m) => m.user_id === userId)?.name ?? ''
}

const dividedParticipantNames = computed(() => {
  const debtorIds = props.splits.map((s) => s.user_id)
  const allIds = [...new Set([props.transaction.user_id, ...debtorIds])]
  return allIds
    .map((id) => getMemberName(id))
    .filter(Boolean)
    .join(', ')
})

const description = computed(() => {
  let desc = props.transaction.concept || ''
  if (props.transaction.isRecurring && props.transaction.frequency) {
    const labels: Record<string, string> = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    }
    const label = labels[props.transaction.frequency] ?? props.transaction.frequency
    desc += desc ? ` · ${label}` : label
  }
  return desc
})

const isMirror = computed(() =>
  MIRROR_PREFIXES.some(p => (props.transaction.concept ?? '').startsWith(p))
)
const MIRROR_PREFIXES = ['(Gasto Compartido)', '(Aportación Conjunta)', '(Aportacion Conjunta)']

const formattedAmount = computed(() => {
  const f = props.transaction.amount.toFixed(2).replace('.', ',')
  return props.transaction.transaction_type === 'income' ? `+${f} €` : `-${f} €`
})
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.transaction-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 25px 16px;
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

  &__icon-wrap {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
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
  }

  &__user-avatars {
    position: absolute;
    bottom: -4px;
    right: -4px;
    display: flex;
    flex-direction: row-reverse;
  }

  &__user-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid $section-bg-primary;
    margin-left: -5px;

    &:last-child {
      margin-left: 0;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 4px 0;
  }

  &__description {
    font-size: 0.8rem;
    color: $color-text-gray;
    margin: 0 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__user-name {
    font-size: 0.75rem;
    color: $color-text-gray;
    font-weight: 500;
    margin: 0;
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
</style>
