<template>
  <div>
    <SectionTitle 
      :title="`| Objetivos (${objectives.length})`"
      :show-add-button="true"
      add-button-text="Añadir objetivo +"
      @add="handleAddObjective"
    />
    
    <section class="objectives">
      <div class="objectives__list">
        <RouterLink 
          v-for="objective in objectives"
          :key="objective.id"
          :to="`/home/${objective.id}/contributions`"
          class="objective-card"
        >
          <div class="objective-card__header">
            <div class="objective-card__icon-title">
              <div class="objective-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 class="objective-card__name">{{ objective.name }}</h3>
            </div>
          </div>

          <div class="objective-card__progress">
            <div class="objective-card__progress-bar">
              <div
                class="objective-card__progress-fill"
                :style="{ width: `${objective.progress}%` }"
              ></div>
            </div>
            <span class="objective-card__percentage">{{ objective.progress }}%</span>
          </div>

          <div class="objective-card__amounts">
            <span class="objective-card__current">{{ formatCurrency(objective.currentAmount) }}</span>
            <span class="objective-card__target">{{ formatCurrency(objective.targetAmount) }}</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import SectionTitle from '@/components/SectionTitle.vue';

interface Objective {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
}

interface Props {
  objectives: Objective[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addObjective: [];
}>();

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handleAddObjective = () => {
  emit('addObjective');
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.objectives {
  padding: 0 $section-margin-horizontal 1.5rem;

  @media (min-width: 768px) {
    padding: 0 0 1.5rem 0;
        margin: 0 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $section-gap;
  }
}

.objective-card {
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 1.25rem;
  transition: transform $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;
  text-decoration: none;
  display: block;
  cursor: pointer;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__icon-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__icon {
    width: $icon-size-lg;
    height: $icon-size-lg;
    background-color: $color-text-gray;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    flex-shrink: 0;
  }

  &__name {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text;
    margin: 0;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  &__progress-bar {
    flex: 1;
    height: 8px;
    background-color: #d0d0d0;
    border-radius: 4px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background-color: $color-text--dk;
    border-radius: 4px;
    transition: width $transition-speed $transition-ease;
  }

  &__percentage {
    font-size: 0.9rem;
    font-weight: 600;
    color: $color-text;
    min-width: 45px;
    text-align: right;
  }

  &__amounts {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: $color-text-gray;
  }

  &__current {
    font-weight: 600;
    color: $color-text;
  }

  &__target {
    font-weight: 500;
  }
}
</style>