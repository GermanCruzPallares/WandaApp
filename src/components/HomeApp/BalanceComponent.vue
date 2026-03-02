<template>
  <div v-if="!isLoading && account !== null">
    <SectionTitle title="| Balance" />
    
    <div class="weekly-balance">
      <div class="weekly-balance__header">
        <h4 class="weekly-balance__title">Balance Semanal</h4>
        <button class="weekly-balance__info-btn" @click="openInfoModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
        </button>
      </div>
      <div 
        class="weekly-balance__message"
        :class="messageClass"
      >
        <span class="message-icon">

          <svg v-if="spendingStatus === 'good'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 13l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          
          <svg v-else-if="spendingStatus === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <div class="message-content">
          <div class="message-title">{{ messageTitle }}</div>
          <div class="message-subtitle">{{ messageSubtitle }}</div>
        </div>
      </div>
      
      <div class="weekly-balance__progress">
        <div class="progress-label">
          <span>Tu Gasto</span>
          <span class="progress-amount">{{ formattedExpenses }} de {{ formattedBudget }}</span>
        </div>
        
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-bar__fill"
              :class="barColorClass"
              :style="{ width: spentPercentage + '%' }"
            ></div>
          </div>
        
          <div 
            class="progress-indicator"
            :style="{ left: weekProgress + '%' }"
          >
            <div class="progress-indicator__line"></div>
          </div>
        </div>
        
        <div class="week-days">
          <span 
            v-for="day in weekDays" 
            :key="day"
            class="week-day"
            :class="{ 'week-day--today': isToday(day) }"
          >
            {{ day }}
          </span>
        </div>
      </div>
      
      <div class="weekly-balance__stats">
        <div class="stat-card">
          <div class="stat-card__value">{{ formattedBudget }}</div>
          <div class="stat-card__label">Presupuesto</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card__value">{{ spentPercentage }}%</div>
          <div class="stat-card__label">Gastado</div>
        </div>
        
        <div class="stat-card">
          <div 
            class="stat-card__value"
            :class="differenceClass"
          >
            {{ formattedDifference }}
          </div>
          <div class="stat-card__label">Diferencia</div>
        </div>
      </div>
    </div>
    <InfoModal
        :is-open="isInfoModalOpen"
        title="¿ Como funciona ?"
        content='Comparamos tu gasto semanal con el tiempo transcurrido. Los gastos frecuentes y las aportaciones a objetivos no se incluyen en este cálculo, ya que son compromisos fijos. Si la barra de gasto está detrás del indicador "Hoy", ¡vas genial! Si está adelante, es momento de ajustar un poco.'
        @close="closeInfoModal"
    />    
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import { useTransactionStore } from '@/stores/TransactionStore';
import SectionTitle from '@/components/SectionTitle.vue';
import InfoModal from '../Modals/InfoModal.vue';
import type { Account } from '@/types/models';

interface Props {
  accountId?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  accountLoaded: [account: Account];
}>();

const accountStore = useAccountStore();
const transactionStore = useTransactionStore();


const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay(); 
  return day === 0 ? 6 : day - 1;
};

const todayDayOfWeek = ref(getCurrentDayOfWeek());

const account = ref<Account | null>(null);
const currentWeekExpenses = ref(0);
const isLoading = ref(false);
const isInfoModalOpen = ref(false);

const openInfoModal = () => {
  isInfoModalOpen.value = true;
};

const closeInfoModal = () => {
  isInfoModalOpen.value = false;
};

const calculateCurrentWeekExpenses = (accountId: number): number => {
  const transactions = transactionStore.getTransactionsFromCache(accountId);
  if (!transactions) return 0;
  
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return transactions
    .filter(t => {
      const tDate = new Date(t.transaction_date);
      return t.transaction_type === 'expense' && 
             !t.isRecurring &&            
             tDate >= monday && 
             tDate <= sunday;
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

const loadAccount = async (accountId: number) => {
  isLoading.value = true;
  
  account.value = await accountStore.fetchAccount(accountId);
  
  if (account.value) {
    await transactionStore.fetchTransactions(accountId);
    currentWeekExpenses.value = calculateCurrentWeekExpenses(accountId);
    
    emit('accountLoaded', account.value);
  }
  
  isLoading.value = false;
};

onMounted(() => {
  if (props.accountId) {
    loadAccount(props.accountId);
  }
});

watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    loadAccount(newAccountId);
  }
});

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const weeklyBudget = computed(() => account.value?.weekly_budget || 0);

const spentPercentage = computed(() => {
  if (weeklyBudget.value === 0) return 0;
  return Math.round((currentWeekExpenses.value / weeklyBudget.value) * 100);
});

const weekProgress = computed(() => {
  return Math.round(((todayDayOfWeek.value + 1) / 7) * 100);
});

const difference = computed(() => {
  if(spentPercentage.value <= 0){
    return 0;
  }
  return spentPercentage.value - weekProgress.value;
});

const spendingStatus = computed(() => {
  const diff = difference.value;
  
  if (diff <= 0) {
    return 'good'; 
  } else if (diff <= 15) {
    return 'warning'; 
  } else {
    return 'danger'; 
  }
});


const formattedBudget = computed(() => {
  return `${weeklyBudget.value}€`;
});

const formattedExpenses = computed(() => {
  return `${Math.round(currentWeekExpenses.value)}€`;
});

const formattedDifference = computed(() => {
  const value = difference.value;
  return value > 0 ? `+${value}%` : `${value}%`;
});


const barColorClass = computed(() => {
  if (spendingStatus.value === 'good') return 'progress-bar__fill--good';
  if (spendingStatus.value === 'warning') return 'progress-bar__fill--warning';
  return 'progress-bar__fill--danger';
});

const messageClass = computed(() => {
  if (spendingStatus.value === 'good') return 'weekly-balance__message--success';
  if (spendingStatus.value === 'warning') return 'weekly-balance__message--warning';
  return 'weekly-balance__message--danger';
});

const differenceClass = computed(() => {
  if (spendingStatus.value === 'good') return 'stat-card__value--positive';
  if (spendingStatus.value === 'warning') return 'stat-card__value--warning';
  return 'stat-card__value--negative';
});


const messageTitle = computed(() => {
  if (spendingStatus.value === 'good') return '¡Excelente ritmo!';
  if (spendingStatus.value === 'warning') return '¡Atención al gasto!';
  return '¡Te has pasado del presupuesto!';
});

const messageSubtitle = computed(() => {
  if (spendingStatus.value === 'good') {
    return 'Vas muy bien, estás gastando menos de lo esperado';
  } else if (spendingStatus.value === 'warning') {
    return 'Estás muy cerca del límite esperado para hoy';
  } else {
    return 'Has superado el gasto esperado para esta parte de la semana';
  }
});

const isToday = (day: string): boolean => {
  const dayIndex = weekDays.indexOf(day);
  return dayIndex === todayDayOfWeek.value;
};
</script>

<style scoped lang="scss">

@import '@/styles/base/variables.scss';

.loading-state {
  margin: 0 $section-margin-horizontal;
  padding: 40px;
  text-align: center;
  background-color: $section-bg-primary;
  border-radius: $section-border-radius;
  
  p {
    margin: 0;
    font-size: 14px;
    color: $color-text-gray;
  }
}

.weekly-balance {
  margin: 0 $section-margin-horizontal;
  padding: $section-padding;
  background-color: $section-bg-primary;
  border-radius: $section-border-radius;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  &__title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: $color-text;
  }
  
  &__info-btn {
    background: none;
    border: none;
    color: $color-text-gray;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color $transition-speed $transition-ease;
    margin-top: -0.6rem; 

    &:hover {
      color: $color-text;
    }
  }
  
  &__message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: $small-border-radius;
    margin-bottom: 20px;
    
    &--success {
      background-color: $bg-success;
      
      .message-icon {
        color: $bg-success-text; 
      }
      
      .message-title {
        color: $bg-success-text;
      }
      
      .message-subtitle {
        color: $bg-success-text-light;
      }
    }
    
    &--warning {
      background-color: $bg-warning;
      
      .message-icon {
        color: $bg-warning-text; 
      }
      
      .message-title {
        color: $bg-warning-text;
      }
      
      .message-subtitle {
        color: $bg-warning-text-light;
      }
    }
    
    &--danger {
      background-color: $bg-danger;
      
      .message-icon {
        color: $bg-danger-text; 
      }
      
      .message-title {
        color: $bg-danger-text;
      }
      
      .message-subtitle {
        color: $bg-danger-text-light;
      }
    }
  }
  
  .message-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin-top: 10px;
  }
  
  .message-content {
    flex: 1;
  }
  
  .message-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .message-subtitle {
    font-size: 12px;
    line-height: 1.4;
  }
  
  &__progress {
    margin-bottom: 20px;
  }
  
  .progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    color: $color-text;
    font-weight: 500;
    
    .progress-amount {
      color: $color-text-gray;
    }
  }
  
  .progress-bar-container {
    position: relative;
    margin-bottom: 8px;
  }
  
  .progress-bar {
    height: 8px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    
    &__fill {
      height: 100%;
      border-radius: 4px;
      transition: width $transition-speed $transition-ease;
      
      &--good {
        background: linear-gradient(90deg, $color-success 0%, $color-success-light 100%);
      }
      
      &--warning {
        background: linear-gradient(90deg, $color-warning-light 0%, $color-warning 100%);
      }
      
      &--danger {
        background: linear-gradient(90deg, $color-danger 0%, $color-danger-light 100%);
      }
    }
  }
  
  .progress-indicator {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    
    &__line {
      width: 2px;
      height: 8px;
      background-color: $color-text--dk;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background-color: $color-text--dk;
        border-radius: 50%;
      }
    }
  }
  
  .week-days {
    display: flex;
    justify-content: space-between;
    padding: 0 2px;
  }
  
  .week-day {
    font-size: 11px;
    color: $color-text-gray;
    font-weight: 500;
    
    &--today {
      color: #9c27b0;
      font-weight: 700;
    }
  }
  
  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

.stat-card {
  background-color: $section-bg-tertiary;
  border-radius: $small-border-radius;
  padding: 16px;
  text-align: center;
  
  &__value {
    font-size: 18px;
    margin-bottom: 4px;
    color: $color-text;
    
    &--positive {
      color: $color-success;
    }
    
    &--warning {
      color: $color-warning;
    }
    
    &--negative {
      color: $color-danger;
    }
  }
  
  &__label {
    font-size: 11px;
    color: $color-text-gray;
    font-weight: 500;
  }
}
</style>