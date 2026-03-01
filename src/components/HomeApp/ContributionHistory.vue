<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/TransactionStore';
import type { Transaction, Objective } from '@/types/models';

interface Props {
  accountId?: number;
  objectives: Objective[];
  initialSelectedObjective?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  initialSelectedObjective: null
});

const emit = defineEmits<{
  savingClick: [transactionId: number];
  transactionsLoaded: [transactions: Transaction[]];
}>();

const transactionStore = useTransactionStore();

const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const selectedObjectiveId = ref<number | null>(props.initialSelectedObjective);

const loadSavings = async (accountId: number) => {
  isLoading.value = true;
  transactions.value = await transactionStore.fetchSavings(accountId);
  emit('transactionsLoaded', transactions.value);
  isLoading.value = false;
};

onMounted(() => {
  if (props.accountId) loadSavings(props.accountId);
});

watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) loadSavings(newAccountId);
});

watch(() => props.initialSelectedObjective, (newValue) => {
  selectedObjectiveId.value = newValue;
});

const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

const getObjectiveName = (objectiveId: number): string => {
  const objective = props.objectives.find(o => o.objective_id === objectiveId);
  return objective?.name || 'Objetivo desconocido';
};

const filteredSavings = computed(() => {
  let result = transactions.value;
  if (selectedObjectiveId.value !== null) {
    result = result.filter(t => t.objective_id === selectedObjectiveId.value);
  }
  return result.sort((a, b) => parseDate(b.transaction_date).getTime() - parseDate(a.transaction_date).getTime());
});

const formatDate = (date: Date | string): string => {
  const d = parseDate(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const transactionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  if (transactionDay.getTime() === today.getTime()) return `Hoy, ${time}`;
  if (transactionDay.getTime() === yesterday.getTime()) return `Ayer, ${time}`;

  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[d.getMonth()]}, ${time}`;
};

const formatAmount = (amount: number): string => {
  return `${amount.toFixed(2).replace('.', ',')} €`;
};

const handleSavingClick = (transactionId: number) => {
  emit('savingClick', transactionId);
};
</script>

<template>
  <div class="savings-history">
    <div v-if="isLoading" class="loading-state">
      <p>Cargando aportaciones...</p>
    </div>

    <template v-else>
      <div class="filter-section">
        <!-- Wrapper que porta los estilos visuales, igual que month-selector__trigger -->
        <div class="objective-filter-wrap">
          <select v-model="selectedObjectiveId" class="objective-filter">
            <option :value="null">Todos los objetivos</option>
            <option
              v-for="objective in objectives"
              :key="objective.objective_id"
              :value="objective.objective_id"
            >
              {{ objective.name }}
            </option>
          </select>
          <svg
            class="objective-filter-wrap__chevron"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="savings-list">
        <div
          v-for="transaction in filteredSavings"
          :key="transaction.transaction_id"
          class="saving-item"
          @click="handleSavingClick(transaction.transaction_id)"
        >
          <div class="saving-item__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>

          <div class="saving-item__info">
            <h4 class="saving-item__title">{{ getObjectiveName(transaction.objective_id) }}</h4>
            <p class="saving-item__date">{{ formatDate(transaction.transaction_date) }}</p>
          </div>

          <div class="saving-item__right">
            <span class="saving-item__amount">+{{ formatAmount(transaction.amount) }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="saving-item__arrow">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div v-if="filteredSavings.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" stroke-width="2" opacity="0.3"/>
          </svg>
          <p>No hay aportaciones registradas</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.savings-history {
  padding: 0 16px;
}

.loading-state {
  padding: 60px 20px;
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
    color: $color-text-gray;
  }
}

.filter-section {
  
  margin-bottom: 20px;
}

// Mismo patrón visual que month-selector__trigger
.objective-filter-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background-color: $section-bg-primary;
  border: 1.5px solid transparent;
  border-radius: $card-border-radius;
  cursor: pointer;
  transition: all $transition-speed $transition-ease;

  &:hover,
  &:focus-within {
    border-color: $color-border--dk;
    background-color: $section-bg-secondary;
  }

  &__chevron {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-gray;
    pointer-events: none;
    flex-shrink: 0;
  }
}

// El select es transparente, el wrapper porta los estilos
.objective-filter {
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  color: $color-text;
  background: transparent;
  border: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 28px; // espacio para el chevron
}

.savings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saving-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 16px;
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
    font-size: 15px;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 4px 0;
  }

  &__date {
    font-size: 13px;
    color: $color-text-gray;
    margin: 0;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__amount {
    font-size: 16px;
    font-weight: 700;
    color: $color-success;
    white-space: nowrap;
  }

  &__arrow {
    color: $color-text-gray;
    flex-shrink: 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: $color-text-gray;
  text-align: center;

  svg {
    margin-bottom: 16px;
    color: $color-text-gray;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}
</style>