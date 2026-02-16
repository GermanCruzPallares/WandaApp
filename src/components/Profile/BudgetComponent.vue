<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import SectionTitle from '@/components/SectionTitle.vue';

const accountStore = useAccountStore();
const weeklyBudget = ref(0);
const monthlyBudget = ref(0);

const props = defineProps<{
  accountId: number
}>();

const emit = defineEmits<{
  edit: [budgetType: 'weekly' | 'monthly'];
}>();

onMounted(async () => {
  const account = await accountStore.fetchAccount(props.accountId);
  
  if (account) {
    weeklyBudget.value = account.weekly_budget;
    monthlyBudget.value = account.monthly_budget;
  }
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handleEdit = (budgetType: 'weekly' | 'monthly') => {
  emit('edit', budgetType);
};
</script>

<template>
  <div class="budget">
    <div class="budget__header">
      <SectionTitle :title="'| Presupuestos'" />
    </div>
    
    <div class="budget__list">
      <!-- Presupuesto Semanal -->
      <div class="budget__item">
        <div class="budget__content">
          <span class="budget__label">Semanal</span>
          <span class="budget__amount">{{ formatCurrency(weeklyBudget) }}</span>
        </div>
        <button class="budget__edit-btn" @click="handleEdit('weekly')">
          Editar
        </button>
      </div>

      <!-- Presupuesto Mensual -->
      <div class="budget__item">
        <div class="budget__content">
          <span class="budget__label">Mensual</span>
          <span class="budget__amount">{{ formatCurrency(monthlyBudget) }}</span>
        </div>
        <button class="budget__edit-btn" @click="handleEdit('monthly')">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.budget {
  padding: 0 $section-margin-horizontal 1.5rem;

  @media (min-width: 768px) {
    padding: 0 0 1.5rem 0;
    margin: 0 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $section-gap;
    margin: 0 16px;
  }

  &__item {
    position: relative;
    padding: 1.5rem;
    background-color: $section-bg-primary;
    border-radius: $card-border-radius;


  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 15px;
    font-weight: 400;
    color: $color-text-gray;
  }

  &__amount {
    font-size: 23px;
    color: $color-text;
  }

  &__edit-btn {
    position: absolute;
    top: 0.6rem;
    right: 0.8rem;
    background: none;
    border: none;
    color: $color-text-gray;
    font-size: 12px;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color $transition-speed $transition-ease;

    &:hover {
      color: $color-text;
    }
  }
}
</style>