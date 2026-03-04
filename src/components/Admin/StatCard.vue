<script setup lang="ts">
interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  format?: 'number' | 'currency';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  format: 'number'
});

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value;
  
  if (props.format === 'currency') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(props.value);
  }
  
  return new Intl.NumberFormat('es-ES').format(props.value);
});

import { computed } from 'vue';
</script>

<template>
  <div class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-card__header">
      <span class="stat-card__title">{{ title }}</span>
    </div>
    <div class="stat-card__body">
      <span class="stat-card__value">{{ formattedValue }}</span>
      <span v-if="subtitle" class="stat-card__subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.stat-card {
  background-color: $color-white;
  border-radius: $card-border-radius;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform $transition-speed $transition-ease, 
              box-shadow $transition-speed $transition-ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &__header {
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: $color-text-gray;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__value {
    font-size: 32px;
    font-weight: 700;
    color: $color-text;
    line-height: 1.2;
  }

  &__subtitle {
    font-size: 13px;
    color: $color-text-gray;
  }

  &--primary {
    border-left: 4px solid $color-text;
  }

  &--success {
    border-left: 4px solid $color-success;
    .stat-card__value { color: $bg-success-text; }
  }

  &--warning {
    border-left: 4px solid $color-warning;
    .stat-card__value { color: $bg-warning-text; }
  }

  &--danger {
    border-left: 4px solid $color-danger;
    .stat-card__value { color: $bg-danger-text; }
  }
}
</style>