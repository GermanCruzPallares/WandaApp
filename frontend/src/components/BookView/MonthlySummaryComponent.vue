<template>
  <div class="monthly-summary">
    <div
      class="summary-card summary-card--income"
      :class="{ loading: isLoading }"
    >
      <span class="summary-card__label">Ingresos</span>
      <span class="summary-card__amount" v-if="!isLoading">
        {{ formatCurrency(income) }}
      </span>
      <div v-else class="skeleton-amount"></div>
    </div>

    <div
      class="summary-card summary-card--expense"
      :class="{ loading: isLoading }"
    >
      <span class="summary-card__label">Gastos</span>
      <span class="summary-card__amount" v-if="!isLoading">
        {{ formatCurrency(-expense) }}
      </span>
      <div v-else class="skeleton-amount"></div>
    </div>

    <div
      class="summary-card summary-card--balance"
      :class="{ loading: isLoading, positive: balance >= 0, negative: balance < 0 }"
    >
      <span class="summary-card__label">Balance</span>
      <span class="summary-card__amount" v-if="!isLoading">
        {{ formatCurrency(balance) }}
      </span>
      <div v-else class="skeleton-amount"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  income: number;
  expense: number;
  isLoading?: boolean;
}>();

const balance = computed(() => props.income - props.expense);

const formatCurrency = (amount: number): string => {
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.monthly-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.summary-card {
  border-radius: $card-border-radius;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 8px;
  transition: transform $transition-speed $transition-ease;

  &:hover {
    transform: translateY(-1px);
  }

  &--income {
    background-color: #5a9e6f;
  }

  &--expense {
    background-color: #c0505a;
  }

  &--balance {
    background-color: $section-bg-primary;

    &.positive .summary-card__amount {
      color: #2e7d4f;
    }

    &.negative .summary-card__amount {
      color: $color-danger;
    }
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    .summary-card--income & { color: rgba(255, 255, 255, 0.85); }
    .summary-card--expense & { color: rgba(255, 255, 255, 0.85); }
    .summary-card--balance & { color: $color-text-gray; }
  }

  &__amount {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    word-break: break-all;

    .summary-card--income & { color: #ffffff; }
    .summary-card--expense & { color: #ffffff; }
    .summary-card--balance & { color: $color-text; }
  }
}

.skeleton-amount {
  height: 18px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  .summary-card--balance & {
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>