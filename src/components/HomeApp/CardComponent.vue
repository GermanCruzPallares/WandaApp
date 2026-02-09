<template>
  <div class="dashboard-card">
    <div class="dashboard-card__header">
      <h2 class="dashboard-card__title">{{ greeting }}</h2>
      <button class="dashboard-card__edit-btn" @click="handleEdit">
        Editar
      </button>
    </div>
    
    <div class="dashboard-card__balance">
      {{ balance }}
    </div>
    
    <div class="dashboard-card__stats">
      <div class="stat">
        <div class="stat__labels">
          <div class="stat__label">Gasto mensual</div>
          <div class="stat__label">Ingreso mensual</div>
        </div>
        <div class="stat__bar stat__bar--expense">
          <div 
            class="stat__bar-fill stat__bar-fill--expense" 
            :style="{ width: expensePercentage + '%' }"
          ></div>
        </div>
        <div class="stat__amounts">
          <div class="stat__amount stat__amount--expense">{{ monthlyExpense }}</div>
          <div class="stat__amount stat__amount--income">{{ monthlyIncome }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  userName?: string;
  balance?: string;
  monthlyExpense?: string;
  monthlyIncome?: string;
  expensePercentage?: number;
  incomePercentage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  userName: 'Clara',
  balance: '13.789,37 €',
  monthlyExpense: '1233.57€',
  monthlyIncome: '2000 €',
  expensePercentage: 60,
  incomePercentage: 100
});

const emit = defineEmits<{
  edit: [];
}>();

const greeting = computed(() => `Hola ${props.userName} !`);

const handleEdit = () => {
  emit('edit');
};
</script>

<style lang="scss">
.dashboard-card {
  background-image: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
        url(../../images/fondo.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  padding: 24px;
  margin: 16px;
  color: white;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
  
  &__edit-btn {
    background-color: rgba(255, 255, 255, 0.25);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  
  &__balance {
    font-size: 25px;
    margin-bottom: 32px;
    letter-spacing: -0.5px;
  }
  
  &__stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.stat {
  // Nuevo: contenedor para los dos labels
  &__labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  &__label {
    font-size: 13px;
    opacity: 0.95;
    font-weight: 400;
  }
  
  &__bar {
    height: 6px;
    border-radius: 3px;
    margin-bottom: 6px;
    overflow: hidden;
    
    &--expense {
      background-color: rgba(255, 255, 255, 0.25);
    }
    
    &--income {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
  
  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
    
    &--expense {
      background: #F70D0D;
    }
  }
  
  &__amounts {
    display: flex;
    justify-content: space-between;
  }
  
  &__amount {
    font-size: 14px;
    font-weight: 600;
    
    &--expense {
      color: #F70D0D;
    }
    
    &--income {
      color: #0DF744;
    }
  }
}
</style>