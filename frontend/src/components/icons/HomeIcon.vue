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
   
    <path
      v-if="!isActive"
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      stroke="#000000"
      stroke-opacity="0.4"
      stroke-width="2"
      fill="none"
      stroke-linejoin="round"
      class="house-path-stroke"
    />
    
    
    <path
      v-else
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill="#000000"
      fill-opacity="1"
      class="house-path-fill"
    />
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
  
  .house-path-stroke,
  .house-path-fill {
    transition: all 0.2s ease;
  }
}
</style>