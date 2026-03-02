<template>
  <div class="transaction-filter">

    <div class="transaction-filter__bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar"
          class="search-input"
          @input="emitFilters"
        />
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <button
        class="filter-btn"
        :class="{ active: hasActiveFilters }"
        @click="toggleFilterPanel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Filtrar
        <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
      </button>
    </div>


    <Transition name="filter-panel">
      <div v-if="showFilterPanel" class="filter-panel">

        <div class="filter-section">
          <p class="filter-section__title">Tipo</p>
          <div class="filter-chips">
            <button
              v-for="type in transactionTypes"
              :key="type.value"
              class="filter-chip"
              :class="{ active: selectedTypes.includes(type.value) }"
              @click="toggleType(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

 
        <div class="filter-section">
          <p class="filter-section__title">Categoría</p>
          <div class="filter-chips filter-chips--wrap">
            <button
              v-for="cat in availableCategories"
              :key="cat"
              class="filter-chip"
              :class="{ active: selectedCategories.includes(cat) }"
              @click="toggleCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>


        <div class="filter-section">
          <p class="filter-section__title">Importe</p>
          <div class="amount-range">
            <div class="amount-input-group">
              <span class="amount-prefix">Min</span>
              <input
                v-model.number="minAmount"
                type="number"
                placeholder="0"
                class="amount-input"
                min="0"
                @input="emitFilters"
              />
              <span class="amount-suffix">€</span>
            </div>
            <span class="range-separator">—</span>
            <div class="amount-input-group">
              <span class="amount-prefix">Max</span>
              <input
                v-model.number="maxAmount"
                type="number"
                placeholder="∞"
                class="amount-input"
                min="0"
                @input="emitFilters"
              />
              <span class="amount-suffix">€</span>
            </div>
          </div>
        </div>

   
        <div class="filter-actions">
          <button class="clear-filters-btn" @click="clearFilters" :disabled="!hasActiveFilters">
            Limpiar filtros
          </button>
          <button class="apply-filters-btn" @click="applyAndClose">
            Aplicar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { availableCategories as allCategories } from '@/components/icons/CategoryIcons';

export interface TransactionFilters {
  search: string;
  types: string[];
  categories: string[];
  minAmount: number | null;
  maxAmount: number | null;
}

const emit = defineEmits<{
  'update:filters': [filters: TransactionFilters];
}>();

const searchQuery = ref('');
const showFilterPanel = ref(false);
const selectedTypes = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const minAmount = ref<number | null>(null);
const maxAmount = ref<number | null>(null);

const transactionTypes = [
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'saving', label: 'Aportaciones' },
];

const availableCategories = allCategories.map(cat =>
  cat.charAt(0).toUpperCase() + cat.slice(1)
);

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedTypes.value.length) count++;
  if (selectedCategories.value.length) count++;
  if (minAmount.value !== null || maxAmount.value !== null) count++;
  return count;
});

const hasActiveFilters = computed(() =>
  activeFilterCount.value > 0 || searchQuery.value.length > 0
);

const toggleType = (type: string) => {
  const idx = selectedTypes.value.indexOf(type);
  if (idx === -1) {
    selectedTypes.value.push(type);
  } else {
    selectedTypes.value.splice(idx, 1);
  }
  emitFilters();
};

const toggleCategory = (cat: string) => {
  const lower = cat.toLowerCase();
  const idx = selectedCategories.value.indexOf(lower);
  if (idx === -1) {
    selectedCategories.value.push(lower);
  } else {
    selectedCategories.value.splice(idx, 1);
  }
  emitFilters();
};

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value;
};

const clearSearch = () => {
  searchQuery.value = '';
  emitFilters();
};

const clearFilters = () => {
  selectedTypes.value = [];
  selectedCategories.value = [];
  minAmount.value = null;
  maxAmount.value = null;
  emitFilters();
};

const applyAndClose = () => {
  emitFilters();
  showFilterPanel.value = false;
};

const emitFilters = () => {
  emit('update:filters', {
    search: searchQuery.value,
    types: selectedTypes.value,
    categories: selectedCategories.value,
    minAmount: minAmount.value,
    maxAmount: maxAmount.value,
  });
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.transaction-filter {
  display: flex;
  flex-direction: column;
  gap: 0;

  &__bar {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: $color-text-gray;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 36px 11px 36px;
  background-color: $section-bg-primary;
  border: 1.5px solid transparent;
  border-radius: $card-border-radius;
  font-size: 14px;
  color: $color-text;
  transition: border-color $transition-speed $transition-ease;

  &::placeholder { color: $color-text-gray; }

  &:focus {
    outline: none;
    border-color: $color-border--dk;
  }
}

.clear-search {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: $color-text-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;

  &:hover { color: $color-text; }
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 16px;
  background-color: $section-bg-primary;
  border: 1.5px solid transparent;
  border-radius: $card-border-radius;
  font-size: 14px;
  font-weight: 500;
  color: $color-text;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: all $transition-speed $transition-ease;

  &:hover, &.active {
    border-color: $color-border--dk;
    background-color: $section-bg-secondary;
  }
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: $color-text--dk;
  color: $color-white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}

.filter-panel {
  background-color: $color-white;
  border: 1px solid #e0e0e0;
  border-radius: $card-border-radius;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-section {
  &__title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: $color-text-gray;
    margin: 0 0 8px 0;
  }
}

.filter-chips {
  display: flex;
  gap: 8px;

  &--wrap {
    flex-wrap: wrap;
  }
}

.filter-chip {
  padding: 6px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: $color-text;
  cursor: pointer;
  transition: all $transition-speed $transition-ease;
  text-transform: capitalize;

  &:hover {
    border-color: $color-border--dk;
    background-color: $section-bg-primary;
  }

  &.active {
    background-color: $color-text--dk;
    border-color: $color-text--dk;
    color: $color-white;
  }
}

.amount-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-separator {
  color: $color-text-gray;
  font-size: 14px;
}

.amount-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: $section-bg-primary;
  border: 1.5px solid transparent;
  border-radius: 8px;
  padding: 8px 10px;
  transition: border-color $transition-speed $transition-ease;

  &:focus-within {
    border-color: $color-border--dk;
  }
}

.amount-prefix {
  font-size: 11px;
  color: $color-text-gray;
  font-weight: 600;
  white-space: nowrap;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: $color-text;
  text-align: center;
  width: 0;
  min-width: 0;

  &:focus { outline: none; }
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button { -webkit-appearance: none; }
}

.amount-suffix {
  font-size: 13px;
  color: $color-text-gray;
}

.filter-actions {
  display: flex;
  gap: 10px;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}

.clear-filters-btn {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #e0e0e0;
  border-radius: 50px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: $color-text-gray;
  cursor: pointer;
  transition: all $transition-speed $transition-ease;

  &:hover:not(:disabled) {
    border-color: $color-border--dk;
    color: $color-text;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.apply-filters-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 50px;
  background-color: $color-text--dk;
  font-size: 13px;
  font-weight: 600;
  color: $color-white;
  cursor: pointer;
  transition: opacity $transition-speed $transition-ease;

  &:hover { opacity: 0.88; }
}


.filter-panel-enter-active,
.filter-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>