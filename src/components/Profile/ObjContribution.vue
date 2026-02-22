<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useObjectiveStore } from '@/stores/ObjectiveStore';
import SectionTitle from '@/components/SectionTitle.vue';
import type { Objective } from '@/types/models';
import CreateObjectiveModal from '@/components/Modals/CreateObjectiveModal.vue';
import { useRouter } from 'vue-router';
// ObjContribution.vue — script
import ContributeObjectiveModal from '@/components/Modals/ContributeObjectiveModal.vue';


const isContributeModalOpen = ref(false);
const selectedObjective = ref<Objective | null>(null);

const handleContribute = (objectiveId: number) => {
  selectedObjective.value = objectives.value.find(o => o.objective_id === objectiveId) || null;
  isContributeModalOpen.value = true;
};


const router = useRouter();
const showSuccess = ref(false);
const isCreateModalOpen = ref(false);

const handleContributed = async () => {
  isContributeModalOpen.value = false;  
  if (props.accountId) await loadObjectives(props.accountId);
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
    router.push('/profile');
  }, 2000);
};

interface Props {
  accountId?: number;
}

const handleAddObjective = () => {
  isCreateModalOpen.value = true;
};

const handleObjectiveCreated = async () => {
  if (props.accountId) await loadObjectives(props.accountId);
  router.push('/profile');
};



const props = defineProps<Props>();

const emit = defineEmits<{
  addObjective: [];
  editObjective: [objectiveId: number];
  contribute: [objectiveId: number];
  objectivesLoaded: [objectives: Objective[]];
}>();

const objectiveStore = useObjectiveStore();
const objectives = ref<Objective[]>([]);
const isLoading = ref(false);

const loadObjectives = async (accountId: number) => {
  isLoading.value = true;
  
  try {
    objectives.value = await objectiveStore.fetchObjectives(accountId);
    emit('objectivesLoaded', objectives.value);
  } catch (error) {
    console.error("Error cargando objetivos", error);
    objectives.value = [];
  }
  
  isLoading.value = false;
};

onMounted(() => {
  if (props.accountId) {
    loadObjectives(props.accountId);
  }
});

watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    loadObjectives(newAccountId);
  }
});

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

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const handleEditObjective = (objectiveId: number) => {
  emit('editObjective', objectiveId);
};

</script>

<template>
  <div v-if="!isLoading" class="objectives">

  <Transition name="toast">
    <div v-if="showSuccess" class="success-toast">
      ✓ Aportación realizada con éxito
    </div>
  </Transition>

    <!-- ObjContribution.vue — template, justo dentro del div raíz -->
    <ContributeObjectiveModal
      v-if="props.accountId && selectedObjective"
      :is-open="isContributeModalOpen"
      :account-id="props.accountId"
      :objective-id="selectedObjective.objective_id"
      :objective-name="selectedObjective.name"
      @close="isContributeModalOpen = false"
      @contributed="handleContributed"
    />

      <CreateObjectiveModal
        v-if="props.accountId"
        :is-open="isCreateModalOpen"
        :account-id="props.accountId"
        @close="isCreateModalOpen = false"
        @created="handleObjectiveCreated"
      />

    <div class="objectives__header">
      <SectionTitle :title="`| Objetivos (${objectives.length})`" />
      <button class="objectives__add-btn" @click="handleAddObjective">
        Añadir objetivo +
      </button>
    </div>
    
    <div class="objectives__list">
      <div 
        v-for="objective in objectives"
        :key="objective.objective_id"
        class="objective"
      >
        <!-- Header con icono, nombre y botón editar -->
        <div class="objective__header">
          <div class="objective__title-group">
            <div class="objective__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 class="objective__name">{{ objective.name }}</h3>
          </div>
          <button class="objective__edit-btn" @click="handleEditObjective(objective.objective_id)">
            Editar
          </button>
        </div>

        <!-- Fecha de cumplimiento y porcentaje -->
        <div class="objective__info-row">
          <div class="objective__deadline">
            <span class="objective__deadline-label">Fecha cumplimiento:</span>
            <span class="objective__deadline-value">{{ formatDate(objective.deadline) }}</span>
          </div>
          <span class="objective__percentage">{{ calculateProgress(objective) }}%</span>
        </div>

        <!-- Barra de progreso -->
        <div class="objective__progress-bar">
          <div
            class="objective__progress-fill"
            :style="{ width: `${calculateProgress(objective)}%` }"
          ></div>
        </div>

        <!-- Cantidades actual y objetivo -->
        <div class="objective__amounts">
          <span class="objective__current">{{ formatCurrency(objective.current_save) }}</span>
          <span class="objective__target">{{ formatCurrency(objective.target_amount) }}</span>
        </div>

        <!-- Botón Aportar -->
        <button class="objective__contribute-btn" @click="handleContribute(objective.objective_id)">
          Aportar +
        </button>
      </div>

      <!-- Estado vacío -->
      <div v-if="objectives.length === 0" class="objectives__empty">
        <p>No hay objetivos registrados</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.success-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: $bg-success;
  color: $bg-success-text;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  z-index: 3000;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.objectives {
  padding: 0 $section-margin-horizontal 1.5rem;

  @media (min-width: 768px) {
    padding: 0 0 1.5rem 0;

  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__add-btn {
    background: none;
    border: none;
    color: $color-text-gray;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem;
    transition: color $transition-speed $transition-ease;

    &:hover {
      color: $color-text;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $section-gap;
  }

  &__empty {
    padding: 40px 20px;
    text-align: center;
    color: $color-text-gray;

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

.objective {
  position: relative;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  margin: 0 16px;
  gap: 0.75rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__icon {
    width: 40px;
    height: 40px;
    background-color: $color-text-gray;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    flex-shrink: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $color-text;
    margin: 0;
  }

  &__edit-btn {
    position: absolute;
    top: 0.6rem;
    right: 0.8rem;
    background: none;
    border: none;
    color: $color-text-gray;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color $transition-speed $transition-ease;

    &:hover {
      color: $color-text;
    }
  }

  &__info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__deadline {
    display: flex;
    gap: 0.5rem;
    font-size: 14px;
  }

  &__deadline-label {
    color: $color-text;
    font-weight: 500;
  }

  &__deadline-value {
    color: $color-text-gray;
  }

  &__percentage {
    font-size: 14px;
    font-weight: 600;
    color: $color-text;
  }

  &__progress-bar {
    width: 100%;
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

  &__amounts {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
  }

  &__current {
    font-weight: 600;
    color: $color-text;
  }

  &__target {
    font-weight: 500;
    color: $color-text-gray;
  }

  &__contribute-btn {
    align-self: center;
    background-color: $color-text--dk;
    color: $color-white;
    border: none;
    border-radius: 50px;
    padding: 0.5rem 1.5rem;
    font-size: 14px;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: opacity $transition-speed $transition-ease;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>