<template>
  <div class="contribution-history">
  <div class="contribution-history">
    <div class="filter-section">
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
    </div>
    </div>

    <!-- Lista de aportaciones -->
    <div class="contributions-list">
      <div
        v-for="contribution in filteredContributions"
        :key="contribution.id"
        class="contribution-item"
        @click="handleContributionClick(contribution.id)"
      >
        <!-- Icono del objetivo -->
        <div class="contribution-item__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>

        <div class="contribution-item__info">
          <h4 class="contribution-item__title">{{ contribution.objective_name }}</h4>
          <p class="contribution-item__date">{{ formatDate(contribution.date) }}</p>
        </div>

        <div class="contribution-item__right">
          <span class="contribution-item__amount">
            +{{ formatAmount(contribution.amount) }}
          </span>
          
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="contribution-item__arrow">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Mensaje si no hay aportaciones -->
      <div v-if="filteredContributions.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        </svg>
        <p>No hay aportaciones registradas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, watch } from 'vue';

// Tipos
export interface Objective {
  objective_id: number;
  account_id: number;
  name: string;
  target_amount: number;
  current_save: number;
  deadline: Date | string;
  objective_picture_url: string;
}

export interface Contribution {
  id: number;
  objective_id: number;
  objective_name: string;
  amount: number;
  date: Date | string;
}

interface Props {
  objectives: Objective[];
  contributions: Contribution[];
  initialSelectedObjective?: number | null;
}
const props = withDefaults(defineProps<Props>(), {
  initialSelectedObjective: null
});

// Parsear fecha
const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};


const emit = defineEmits<{
  contributionClick: [contributionId: number];
}>();



// Filtro seleccionado (inicializar con el valor de la prop)
const selectedObjectiveId = ref<number | null>(props.initialSelectedObjective);

// Cuando cambie la prop, actualizar el filtro
watch(() => props.initialSelectedObjective, (newValue) => {
  selectedObjectiveId.value = newValue;
});


// Aportaciones filtradas
const filteredContributions = computed(() => {
  let result = props.contributions;

  // Filtrar por objetivo si hay uno seleccionado
  if (selectedObjectiveId.value !== null) {
    result = result.filter(c => c.objective_id === selectedObjectiveId.value);
  }

  // Ordenar por fecha (más reciente primero)
  return result.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
});




// Formatear fecha
const formatDate = (date: Date | string): string => {
  const d = parseDate(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const contributionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  if (contributionDay.getTime() === today.getTime()) {
    return `Hoy, ${time}`;
  } else if (contributionDay.getTime() === yesterday.getTime()) {
    return `Ayer, ${time}`;
  } else {
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = months[d.getMonth()];
    return `${day} ${month}, ${time}`;
  }
};

// Formatear cantidad
const formatAmount = (amount: number): string => {
  return `${amount.toFixed(2).replace('.', ',')} €`;
};

const handleContributionClick = (contributionId: number) => {
  emit('contributionClick', contributionId);
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.contribution-history {
  padding: 0 16px;
}

.filter-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.objective-filter {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: $color-text;
  background-color: $background-principal;
  border: 1px solid $color-text--dk;
  border-radius: $card-border-radius;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  transition: border-color $transition-speed $transition-ease;

  &:focus {
    outline: none;
    border-color: $color-text;
  }

  &:hover {
    border-color: $color-text-gray;
  }
}

.contributions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contribution-item {
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
    font-size: 12px;
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
    font-size: 15px;
    font-weight: 600;
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