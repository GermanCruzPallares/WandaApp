<template>
  <div class="month-selector">
    <button class="month-selector__trigger" @click="toggleDropdown" :class="{ open: isOpen }">
      <span class="month-selector__label">{{ formattedLabel }}</span>
      <svg
        class="month-selector__chevron"
        :class="{ rotated: isOpen }"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="month-selector__dropdown" v-click-outside="closeDropdown">
        <div class="month-selector__year-nav">
          <button class="year-btn" @click="prevYear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="year-label">{{ displayYear }}</span>
          <button class="year-btn" @click="nextYear" :disabled="displayYear >= currentYear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="month-selector__grid">
          <button
            v-for="(month, index) in months"
            :key="index"
            class="month-btn"
            :class="{
              active: index === selectedMonth && displayYear === selectedYear,
              disabled: isFutureMonth(index, displayYear)
            }"
            :disabled="isFutureMonth(index, displayYear)"
            @click="selectMonth(index)"
          >
            {{ month.short }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: { month: number; year: number };
}>();

const emit = defineEmits<{
  'update:modelValue': [value: { month: number; year: number }];
}>();

const isOpen = ref(false);
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

const displayYear = ref(props.modelValue.year);
const selectedMonth = computed(() => props.modelValue.month);
const selectedYear = computed(() => props.modelValue.year);

const months = [
  { short: 'Ene', long: 'Enero' },
  { short: 'Feb', long: 'Febrero' },
  { short: 'Mar', long: 'Marzo' },
  { short: 'Abr', long: 'Abril' },
  { short: 'May', long: 'Mayo' },
  { short: 'Jun', long: 'Junio' },
  { short: 'Jul', long: 'Julio' },
  { short: 'Ago', long: 'Agosto' },
  { short: 'Sep', long: 'Septiembre' },
  { short: 'Oct', long: 'Octubre' },
  { short: 'Nov', long: 'Noviembre' },
  { short: 'Dic', long: 'Diciembre' },
];

const formattedLabel = computed(() => {
  return `${months[selectedMonth.value]?.long}-${selectedYear.value}`;
});

const isFutureMonth = (monthIndex: number, year: number) => {
  if (year > currentYear) return true;
  if (year === currentYear && monthIndex > currentMonth) return true;
  return false;
};

const prevYear = () => {
  if (displayYear.value > 2000) displayYear.value--;
};

const nextYear = () => {
  if (displayYear.value < currentYear) displayYear.value++;
};

const selectMonth = (monthIndex: number) => {
  emit('update:modelValue', { month: monthIndex, year: displayYear.value });
  isOpen.value = false;
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    displayYear.value = selectedYear.value;
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};


</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.month-selector {
  position: relative;
  width: 100%;

  &__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background-color: $section-bg-primary;
    border: 1.5px solid transparent;
    border-radius: $card-border-radius;
    cursor: pointer;
    transition: all $transition-speed $transition-ease;

    &:hover,
    &.open {
      border-color: $color-border--dk;
      background-color: $section-bg-secondary;
    }
  }

  &__label {
    font-size: 15px;
    font-weight: 600;
    color: $color-text;
    text-transform: capitalize;
  }

  &__chevron {
    color: $color-text-gray;
    transition: transform $transition-speed $transition-ease;
    flex-shrink: 0;

    &.rotated {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background-color: $color-white;
    border: 1px solid #e0e0e0;
    border-radius: $card-border-radius;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 500;
    overflow: hidden;
    padding: 12px;
  }

  &__year-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 12px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
}

.year-label {
  font-size: 15px;
  font-weight: 700;
  color: $color-text;
}

.year-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: $section-bg-primary;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text;
  transition: background-color $transition-speed $transition-ease;

  &:hover:not(:disabled) {
    background-color: $section-bg-secondary;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.month-btn {
  padding: 8px 4px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: $color-text;
  cursor: pointer;
  transition: all $transition-speed $transition-ease;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: $section-bg-primary;
  }

  &.active {
    background-color: $color-text--dk;
    color: $color-white;
    font-weight: 700;
  }

  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

// Animación dropdown
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>