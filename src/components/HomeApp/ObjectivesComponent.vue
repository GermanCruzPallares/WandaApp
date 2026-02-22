<template>
  <div v-if="!isLoading">
    <SectionTitle 
      :title="`| Objetivos (${objectives.length})`"
    />
    
    <section class="objectives">

      <div class="objectives__list">
        <RouterLink 
          v-for="objective in objectives"
          :key="objective.objective_id"
          :to="`/home/contributions/${objective.objective_id}`"
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
                :style="{ width: `${calculateProgress(objective)}%` }"
              ></div>
            </div>
            <span class="objective-card__percentage">{{ calculateProgress(objective) }}%</span>
          </div>

          <div class="objective-card__amounts">
            <span class="objective-card__current">{{ formatCurrency(objective.current_save) }}</span>
            <span class="objective-card__target">{{ formatCurrency(objective.target_amount) }}</span>
          </div>
        </RouterLink>
      </div>

      <div v-if="objectives.length === 0" class="empty-state">
        <p>No hay objetivos registrados</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useObjectiveStore } from '@/stores/ObjectiveStore';
import SectionTitle from '@/components/SectionTitle.vue';
import type { Objective } from '@/types/models';
import CreateObjectiveModal from '@/components/Modals/CreateObjectiveModal.vue';
import { useRouter } from 'vue-router';




interface Props {
  accountId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addObjective: [];
  objectivesLoaded: [objectives: Objective[]];
}>();




// ✅ Usar el store de Pinia
const objectiveStore = useObjectiveStore();

// Estado local
const objectives = ref<Objective[]>([]);
const isLoading = ref(false);

// ✅ Cargar objetivos desde el store
const loadObjectives = async (accountId: number) => {
  isLoading.value = true;
  
  // Asegúrate de que el store devuelve un array (aunque esté vacío)
  try {
    objectives.value = await objectiveStore.fetchObjectives(accountId);
  } catch (error) {
    console.error("Error cargando objetivos", error);
    objectives.value = [];
  }
  
  if (objectives.value) {
    emit('objectivesLoaded', objectives.value);
  }
  
  isLoading.value = false;
};

// Cargar cuando se monta
onMounted(() => {
  if (props.accountId) {
    loadObjectives(props.accountId);
  }
});

// Recargar cuando cambia la cuenta
watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    loadObjectives(newAccountId);
  }
});

// ✅ Calcular progreso
const calculateProgress = (objective: Objective): number => {
  if (objective.target_amount === 0) return 0;
  return Math.round((objective.current_save / objective.target_amount) * 100);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

</script>
<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.loading-state {
  padding: 40px 20px;
  text-align: center;
  
  p {
    margin: 0;
    font-size: 14px;
    color: $color-text-gray;
  }
}

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