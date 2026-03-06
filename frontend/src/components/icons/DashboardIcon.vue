<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ active: isActive }"
    @focus="handleFocus(true)"
    @blur="handleFocus(false)"
    :tabindex="focusable ? 0 : -1"
  >
    <g v-if="!isActive" class="dashboard-group">
      <rect x="4" y="4" width="7" height="7" rx="1" stroke="#000000" stroke-opacity="0.4" stroke-width="2" />
      <rect x="13" y="4" width="7" height="7" rx="1" stroke="#000000" stroke-opacity="0.4" stroke-width="2" />
      <rect x="4" y="13" width="7" height="7" rx="1" stroke="#000000" stroke-opacity="0.4" stroke-width="2" />
      <rect x="13" y="13" width="7" height="7" rx="1" stroke="#000000" stroke-opacity="0.4" stroke-width="2" />
    </g>

    <g v-else class="dashboard-group">
      <rect x="4" y="4" width="7" height="7" rx="1" fill="#000000" fill-opacity="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" fill="#000000" fill-opacity="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" fill="#000000" fill-opacity="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" fill="#000000" fill-opacity="1" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isActive?: boolean;
  focusable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  focusable: true,
});

const isFocused = ref(false);

const handleFocus = (state: boolean) => {
  isFocused.value = state;
};
</script>

<style scoped lang="scss">
svg {
  cursor: pointer;
  outline: none;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
  }

  .dashboard-group {
    transition: all 0.2s ease;
    
    rect {
      transition: all 0.2s ease;
    }
  }
}
</style>