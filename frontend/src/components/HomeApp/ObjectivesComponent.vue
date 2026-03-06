<template>
  <div v-if="!isLoading">
    <SectionTitle :title="`| Objetivos (${objectives.length})`" />

    <section class="objectives">
      <div class="objectives__list">
        <div
          v-for="objective in objectives"
          :key="objective.objective_id"
          class="objective-card"
          :class="{
            'objective-card--completed': calculateProgress(objective) >= 100,
            'objective-card--expired': isExpired(objective),
          }"
        >
          <!-- Contenido navegable -->
          <RouterLink
            :to="`/home/contributions/${objective.objective_id}`"
            class="objective-card__link"
          >
            <div class="objective-card__header">
              <div class="objective-card__icon-title">
                <div class="objective-card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                <h3 class="objective-card__name">{{ objective.name }}</h3>
              </div>

              <div
                v-if="isExpired(objective)"
                class="objective-card__badge objective-card__badge--expired"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  />
                </svg>
                Fecha superada
              </div>
            </div>

            <div class="objective-card__progress">
              <div class="objective-card__progress-bar">
                <div
                  class="objective-card__progress-fill"
                  :style="{ width: `${Math.min(calculateProgress(objective), 100)}%` }"
                ></div>
              </div>
              <span class="objective-card__percentage">{{ calculateProgress(objective) }}%</span>
            </div>

            <div class="objective-card__amounts">
              <span class="objective-card__current">{{
                formatCurrency(objective.current_save)
              }}</span>
              <span class="objective-card__target">{{
                formatCurrency(objective.target_amount)
              }}</span>
            </div>
          </RouterLink>

          <!-- Fila completado + botón archivar (fuera del RouterLink) -->
          <div v-if="calculateProgress(objective) >= 100" class="objective-card__completed-row">
            <div class="objective-card__badge objective-card__badge--completed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Cumplido
            </div>
            <button
              class="objective-card__archive-btn"
              :disabled="isArchiving === objective.objective_id"
              @click.prevent="handleArchiveObjective(objective.objective_id)"
              title="Archivar este objetivo"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"
                />
              </svg>
              {{ isArchiving === objective.objective_id ? 'Archivando...' : 'Archivar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="objectives.length === 0" class="empty-state">
        <p>No hay objetivos activos</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useObjectiveStore } from '@/stores/ObjectiveStore'
import SectionTitle from '@/components/SectionTitle.vue'
import type { Objective } from '@/types/models'

interface Props {
  accountId: number
}
const props = defineProps<Props>()

const emit = defineEmits<{
  addObjective: []
  objectivesLoaded: [objectives: Objective[]]
}>()

const objectiveStore = useObjectiveStore()
const objectives = ref<Objective[]>([])
const isLoading = ref(false)
const isArchiving = ref<number | null>(null)

// ── Archivar ──────────────────────────────────────────────────────────────
const handleArchiveObjective = async (objectiveId: number) => {
  isArchiving.value = objectiveId
  try {
    await objectiveStore.archiveObjective(objectiveId, props.accountId)
    // Recargar activos tras archivar
    await loadObjectives(props.accountId)
  } catch (error) {
    console.error('Error archivando objetivo', error)
  }
  isArchiving.value = null
}

// ── Carga ─────────────────────────────────────────────────────────────────
const loadObjectives = async (accountId: number) => {
  isLoading.value = true
  try {
    objectives.value = await objectiveStore.fetchObjectives(accountId, { isArchived: false })
    emit('objectivesLoaded', objectives.value)
  } catch (error) {
    objectives.value = []
  }
  isLoading.value = false
}

onMounted(() => {
  if (props.accountId) loadObjectives(props.accountId)
})
watch(
  () => props.accountId,
  (id) => {
    if (id) loadObjectives(id)
  },
)

// ── Helpers ───────────────────────────────────────────────────────────────
const calculateProgress = (objective: Objective): number => {
  if (objective.target_amount === 0) return 0
  return Math.round((objective.current_save / objective.target_amount) * 100)
}

const isExpired = (objective: Objective): boolean => {
  if (calculateProgress(objective) >= 100) return false
  return new Date(objective.deadline) < new Date()
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0;

  &__completed-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__archive-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid $color-success;
    color: $color-success;
    border-radius: 50px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color $transition-speed $transition-ease,
      color $transition-speed $transition-ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      background-color: $color-success;
      color: $color-white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__link {
    text-decoration: none;
    display: block;
    transition: transform $transition-speed $transition-ease;
    &:hover {
      transform: translateX(2px);
    }
  }

  &--completed {
    border-color: $color-success;
    .objective-card__icon {
      background-color: $color-success;
    }
    .objective-card__progress-fill {
      background-color: $color-success;
    }
    .objective-card__percentage {
      color: $color-success;
    }
  }

  &--expired {
    border-color: $color-danger;
    .objective-card__icon {
      background-color: $color-danger;
    }
    .objective-card__progress-fill {
      background-color: $color-danger;
    }
    .objective-card__percentage {
      color: $color-danger;
    }
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
    transition: background-color $transition-speed $transition-ease;
  }

  &__name {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text;
    margin: 0;
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 50px;
    white-space: nowrap;

    &--completed {
      color: $color-success;
      background-color: rgba(76, 175, 80, 0.1);
    }

    &--expired {
      color: $color-danger;
      background-color: rgba(244, 67, 54, 0.1);
    }
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: $color-text-gray;
  text-align: center;
  p {
    font-size: 14px;
    margin: 0;
  }
}
</style>
