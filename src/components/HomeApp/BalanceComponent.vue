<template>
  <div class="balance-section">
    <h3 class="balance-section__title">| Balance</h3>
    
    <div class="weekly-balance">
      <div class="weekly-balance__header">
        <h4 class="weekly-balance__title">Balance Semanal</h4>
        <button class="weekly-balance__info-btn">
          <span class="info-icon">ⓘ</span>
        </button>
      </div>
      
      <div 
        class="weekly-balance__message"
        :class="messageClass"
      >
        <span class="message-icon">{{ messageIcon }}</span>
        <div class="message-content">
          <div class="message-title">{{ messageTitle }}</div>
          <div class="message-subtitle">{{ messageSubtitle }}</div>
        </div>
      </div>
      
      <!-- Barra de progreso con indicador de "Hoy" -->
      <div class="weekly-balance__progress">
        <div class="progress-label">
          <span>Tu Gasto</span>
          <span class="progress-amount">{{ formattedExpenses }} de {{ formattedBudget }}</span>
        </div>
        
        <div class="progress-bar-container">
          <!-- Barra de gasto -->
          <div class="progress-bar">
            <div 
              class="progress-bar__fill"
              :class="barColorClass"
              :style="{ width: spentPercentage + '%' }"
            ></div>
          </div>
          
          <!-- Indicador de "Hoy" (día actual de la semana) -->
          <div 
            class="progress-indicator"
            :style="{ left: weekProgress + '%' }"
          >
            <div class="progress-indicator__line"></div>
          </div>
        </div>
        
        <!-- Días de la semana -->
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
      
      <!-- Estadísticas -->
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  weeklyBudget?: number;        // Presupuesto semanal
  currentWeekExpenses?: number; // Gastos acumulados de la semana
  todayDayOfWeek?: number;      // 0=Lunes, 6=Domingo
}

const props = withDefaults(defineProps<Props>(), {
  weeklyBudget: 160,
  currentWeekExpenses: 80,
  todayDayOfWeek: 4 // Jueves por defecto
});

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Cálculos
const spentPercentage = computed(() => {
  return Math.round((props.currentWeekExpenses / props.weeklyBudget) * 100);
});

const weekProgress = computed(() => {
  // Porcentaje de semana transcurrida
  return Math.round(((props.todayDayOfWeek + 1) / 7) * 100);
});

const difference = computed(() => {
  return spentPercentage.value - weekProgress.value;
});

const isOnTrack = computed(() => {
  return difference.value <= 0;
});

// Estado del gasto (verde, amarillo, rojo)
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

// Formateo
const formattedBudget = computed(() => {
  return `${props.weeklyBudget}€`;
});

const formattedExpenses = computed(() => {
  return `${props.currentWeekExpenses}€`;
});

const formattedDifference = computed(() => {
  const value = difference.value;
  return value > 0 ? `+${value}%` : `${value}%`;
});

// Clases dinámicas
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

// Mensajes dinámicos
const messageIcon = computed(() => {
  if (spendingStatus.value === 'good') return '📈';
  if (spendingStatus.value === 'warning') return '⚠️';
  return '🚨';
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
  return dayIndex === props.todayDayOfWeek;
};
</script>

<style lang="scss">
.balance-section {

position: relative;
  padding: 16px;
  
  &__title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1a1a1a;
  }
}

.weekly-balance {
  background-color: #D9D9D9;
  border-radius: 16px;
  padding: 20px;
  
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
    color: #1a1a1a;
  }
  
  &__info-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    
    .info-icon {
      color: #666;
      font-size: 18px;
    }
  }
  
  &__message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 5px;
    margin-bottom: 20px;
    
    &--success {
      background-color: #A2DBB7;
      
      .message-title {
        color: #1d6f42;
      }
      
      .message-subtitle {
        color: #2d8659;
      }
    }
    
    &--warning {
      background-color: #ffe0b2;
      
      .message-title {
        color: #e65100;
      }
      
      .message-subtitle {
        color: #f57c00;
      }
    }
    
    &--danger {
      background-color: #ffcccb;
      
      .message-title {
        color: #c41e3a;
      }
      
      .message-subtitle {
        color: #d64545;
      }
    }
  }
  
  .message-icon {
    font-size: 24px;
    line-height: 1;
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
    color: #1a1a1a;
    font-weight: 500;
    
    .progress-amount {
      color: #666;
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
      transition: width 0.3s ease;
      
      &--good {
        background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
      }
      
      &--warning {
        background: linear-gradient(90deg, #ffa726 0%, #ffb74d 100%);
      }
      
      &--danger {
        background: linear-gradient(90deg, #f44336 0%, #e57373 100%);
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
      background-color: #333;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background-color: #333;
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
    color: #666;
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
  background-color: #ECECEC;
  border-radius: 5px;
  padding: 16px;
  text-align: center;
  
  &__value {
    font-size: 18px;
    margin-bottom: 4px;
    color: #1a1a1a;
    
    &--positive {
      color: #4caf50;
    }
    
    &--warning {
      color: #ff9800;
    }
    
    &--negative {
      color: #f44336;
    }
  }
  
  &__label {
    font-size: 11px;
    color: #666;
    font-weight: 500;
  }
}
</style>