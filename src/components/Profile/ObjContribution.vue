<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useObjectiveStore } from '@/stores/ObjectiveStore';
import SectionTitle from '@/components/SectionTitle.vue';
import type { Objective } from '@/types/models';
import CreateObjectiveModal from '@/components/Modals/CreateObjectiveModal.vue';
import { useRouter } from 'vue-router';
import ContributeObjectiveModal from '@/components/Modals/ContributeObjectiveModal.vue';
import EditObjectiveModal from '@/components/Modals/EditObjectiveModal.vue';

// ── Modales ──────────────────────────────────────────────────────────────
const isEditModalOpen = ref(false);
const isContributeModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const selectedObjective = ref<Objective | null>(null);

const handleEditObjective = (objectiveId: number) => {
  if (!props.accountId) return;
  selectedObjective.value = objectives.value.find(o => o.objective_id === objectiveId) || null;
  isEditModalOpen.value = true;
};

const handleObjectiveUpdated = async () => {
  isEditModalOpen.value = false;
  if (props.accountId) await loadObjectives(props.accountId);
};

const handleObjectiveDeleted = async () => {
  isEditModalOpen.value = false;
  if (props.accountId) await loadObjectives(props.accountId);
};

const handleContribute = (objectiveId: number) => {
  selectedObjective.value = objectives.value.find(o => o.objective_id === objectiveId) || null;
  isContributeModalOpen.value = true;
};

const handleContributed = async () => {
  isContributeModalOpen.value = false;
  if (props.accountId) await loadObjectives(props.accountId);
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
    router.push('/profile');
  }, 2000);
};

const handleAddObjective = () => { isCreateModalOpen.value = true; };

const handleObjectiveCreated = async () => {
  if (props.accountId) await loadObjectives(props.accountId);
  router.push('/profile');
};

// ── Props / emits ────────────────────────────────────────────────────────
interface Props { accountId?: number; }
const props = defineProps<Props>();
const emit = defineEmits<{
  addObjective: [];
  editObjective: [objectiveId: number];
  contribute: [objectiveId: number];
  objectivesLoaded: [objectives: Objective[]];
}>();

// ── Store / estado ────────────────────────────────────────────────────────
const router = useRouter();
const objectiveStore = useObjectiveStore();
const objectives = ref<Objective[]>([]);
const isLoading = ref(false);
const showSuccess = ref(false);
const isArchiving = ref<number | null>(null); // ID del objetivo en proceso de archivo

// ── Vista archivados ──────────────────────────────────────────────────────
const showArchived = ref(false);
const archivedObjectives = ref<Objective[]>([]);
const isLoadingArchived = ref(false);

const toggleArchived = async () => {
  showArchived.value = !showArchived.value;
  if (showArchived.value && props.accountId) {
    await loadArchivedObjectives(props.accountId);
  }
};

const loadArchivedObjectives = async (accountId: number) => {
  isLoadingArchived.value = true;
  try {
    archivedObjectives.value = await objectiveStore.fetchArchivedObjectives(accountId);
  } catch (error) {
    console.error('Error cargando archivados', error);
    archivedObjectives.value = [];
  }
  isLoadingArchived.value = false;
};

// ── Archivar objetivo ─────────────────────────────────────────────────────
/**
 * Llama al PATCH /api/objectives/{id}/archive y recarga los activos.
 * Si el panel de archivados está abierto, lo recarga también.
 */
const handleArchiveObjective = async (objectiveId: number) => {
  if (!props.accountId) return;
  isArchiving.value = objectiveId;
  try {
    await objectiveStore.archiveObjective(objectiveId, props.accountId);
    // Recargar activos
    await loadObjectives(props.accountId);
    // Recargar archivados si el panel está abierto
    if (showArchived.value) await loadArchivedObjectives(props.accountId);
  } catch (error) {
    console.error('Error archivando objetivo', error);
  }
  isArchiving.value = null;
};

// ── Carga de objetivos activos ────────────────────────────────────────────
// loadObjectives en ObjContribution.vue
const loadObjectives = async (accountId: number) => {
  isLoading.value = true;
  try {
    // Forzar isArchived: false para excluir archivados siempre
    objectives.value = await objectiveStore.fetchObjectives(accountId, { isArchived: false });
    emit('objectivesLoaded', objectives.value);
  } catch (error) {
    console.error('Error cargando objetivos', error);
    objectives.value = [];
  }
  isLoading.value = false;
};

onMounted(() => { if (props.accountId) loadObjectives(props.accountId); });
watch(() => props.accountId, (id) => { if (id) loadObjectives(id); });

// ── Helpers de UI ─────────────────────────────────────────────────────────
const calculateProgress = (objective: Objective): number => {
  if (objective.target_amount === 0) return 0;
  return Math.round((objective.current_save / objective.target_amount) * 100);
};

const isExpired = (objective: Objective): boolean => {
  if (objective.is_completed) return false;
  return new Date(objective.deadline) < new Date();
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>

<template>
  <div v-if="!isLoading" class="objectives">

    <!-- Toast de éxito -->
    <Transition name="toast">
      <div v-if="showSuccess" class="success-toast">✓ Aportación realizada con éxito</div>
    </Transition>

    <!-- Modales -->
    <EditObjectiveModal v-if="props.accountId && selectedObjective" :is-open="isEditModalOpen"
      :account-id="props.accountId" :objective="selectedObjective" @close="isEditModalOpen = false"
      @updated="handleObjectiveUpdated" @deleted="handleObjectiveDeleted" />
    <ContributeObjectiveModal v-if="props.accountId && selectedObjective" :is-open="isContributeModalOpen"
      :account-id="props.accountId" :objective-id="selectedObjective.objective_id"
      :objective-name="selectedObjective.name" @close="isContributeModalOpen = false"
      @contributed="handleContributed" />
    <CreateObjectiveModal v-if="props.accountId" :is-open="isCreateModalOpen" :account-id="props.accountId"
      @close="isCreateModalOpen = false" @created="handleObjectiveCreated" />

    <!-- Cabecera -->
    <div class="objectives__header">
      <SectionTitle :title="`| Objetivos (${objectives.length})`" />
      <div class="objectives__header-actions">
        <button v-if="archivedObjectives.length > 0 || showArchived" class="objectives__archived-toggle"
          :class="{ 'objectives__archived-toggle--active': showArchived }" @click="toggleArchived">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
          </svg>
          {{ showArchived ? 'Ocultar archivados' : `Archivados (${archivedObjectives.length || '...'})` }}
        </button>
        <button class="objectives__add-btn" @click="handleAddObjective">Añadir objetivo +</button>
      </div>
    </div>

    <!-- Lista de objetivos activos -->
    <div class="objectives__list">
      <div v-for="objective in objectives" :key="objective.objective_id" class="objective" :class="{
        'objective--completed': calculateProgress(objective) >= 100,
        'objective--expired': isExpired(objective)
      }">
        <div class="objective__header">
          <div class="objective__title-group">
            <div class="objective__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 class="objective__name">{{ objective.name }}</h3>
          </div>
          <button class="objective__edit-btn" @click="handleEditObjective(objective.objective_id)">
            Editar
          </button>
        </div>

        <div class="objective__info-row">
          <div class="objective__deadline">
            <span class="objective__deadline-label">Fecha cumplimiento:</span>
            <span class="objective__deadline-value">{{ formatDate(objective.deadline) }}</span>
          </div>
          <span class="objective__percentage">{{ calculateProgress(objective) }}%</span>
        </div>

        <div class="objective__progress-bar">
          <div class="objective__progress-fill" :style="{ width: `${Math.min(calculateProgress(objective), 100)}%` }">
          </div>
        </div>

        <div class="objective__amounts">
          <span class="objective__current">{{ formatCurrency(objective.current_save) }}</span>
          <span class="objective__target">{{ formatCurrency(objective.target_amount) }}</span>
        </div>

        <!-- Completado: badge + botón archivar -->
        <template v-if="objective.is_completed">
          <div class="objective__completed-row">
            <div class="objective__badge objective__badge--completed">✓ Objetivo cumplido</div>
            <button class="objective__archive-btn" :disabled="isArchiving === objective.objective_id"
              @click="handleArchiveObjective(objective.objective_id)" title="Archivar este objetivo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l .94 1H5.12z" />
              </svg>
              {{ isArchiving === objective.objective_id ? 'Archivando...' : 'Archivar' }}
            </button>
          </div>
        </template>

        <!-- Expirado -->
        <div v-else-if="isExpired(objective)" class="objective__badge objective__badge--expired">
          ⚠ Fecha superada sin completar
        </div>

        <!-- Aportar -->
        <button v-if="calculateProgress(objective) < 100 && !isExpired(objective)" class="objective__contribute-btn"
          @click="handleContribute(objective.objective_id)">
          Aportar +
        </button>
      </div>

      <!-- Estado vacío -->
      <div v-if="objectives.length === 0" class="objectives__empty">
        <p>No hay objetivos activos</p>
      </div>
    </div>

    <!-- Panel de archivados -->
    <Transition name="slide">
      <div v-if="showArchived" class="objectives__archived-panel">
        <div class="objectives__archived-header">
          <span>Objetivos archivados</span>
        </div>
        <div v-if="isLoadingArchived" class="objectives__empty">
          <p>Cargando archivados...</p>
        </div>
        <div v-else-if="archivedObjectives.length === 0" class="objectives__empty">
          <p>No hay objetivos archivados</p>
        </div>
        <div v-else class="objectives__list objectives__list--archived">
          <div v-for="obj in archivedObjectives" :key="obj.objective_id" class="objective objective--archived">
            <div class="objective__header">
              <div class="objective__title-group">
                <div class="objective__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 class="objective__name">{{ obj.name }}</h3>
              </div>
              <div class="objective__badge objective__badge--archived">Archivado</div>
            </div>
            <div class="objective__amounts">
              <span class="objective__current">{{ formatCurrency(obj.current_save) }}</span>
              <span class="objective__target">/ {{ formatCurrency(obj.target_amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
    margin-left: -$section-margin-horizontal;
    margin-right: -$section-margin-horizontal;

    @media (min-width: 768px) {
      margin-left: 0;
      margin-right: 0;
    }
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  &__archived-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid $color-text-gray;
    color: $color-text-gray;
    border-radius: 50px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all $transition-speed $transition-ease;

    &:hover,
    &--active {
      border-color: $color-text;
      color: $color-text;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $section-gap;

    @media (min-width: 768px) {
      margin: 0 16px;
    }

    &--archived {
      margin-top: 0.5rem;
    }
  }

  &__empty {
    padding: 32px 20px;
    text-align: center;
    color: $color-text-gray;

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__archived-panel {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px dashed rgba(0, 0, 0, 0.12);
  }

  &__archived-header {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-gray;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.objective {
  position: relative;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 2px solid transparent;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

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
    transition: background-color $transition-speed $transition-ease;
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

  &__completed-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__archive-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid $color-success;
    color: $color-success;
    border-radius: 50px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color $transition-speed $transition-ease,
      color $transition-speed $transition-ease;

    &:hover:not(:disabled) {
      background-color: $color-success;
      color: $color-white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__badge {
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &--completed {
      color: $color-success;
      background-color: rgba(76, 175, 80, 0.1);
    }

    &--expired {
      color: $color-danger;
    }

    &--archived {
      color: $color-text-gray;
      background-color: rgba(0, 0, 0, 0.06);
      font-size: 11px;
    }
  }

  // Estados
  &--completed {
    border-color: $color-success;

    .objective__icon {
      background-color: $color-success;
    }

    .objective__progress-fill {
      background-color: $color-success;
    }

    .objective__percentage {
      color: $color-success;
    }

    .objective__deadline-value {
      color: $color-success;
    }
  }

  &--expired {
    border-color: $color-danger;

    .objective__icon {
      background-color: $color-danger;
    }

    .objective__progress-fill {
      background-color: $color-danger;
    }

    .objective__percentage {
      color: $color-danger;
    }

    .objective__deadline-value {
      color: $color-danger;
      font-weight: 600;
    }
  }

  &--archived {
    opacity: 0.7;
    border-color: transparent;

    .objective__icon {
      background-color: $color-text-gray;
    }

    margin: 0 16px;
  }
}
</style>