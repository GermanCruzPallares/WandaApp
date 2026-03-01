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
   
    <rect
      v-if="!isActive"
      x="4"
      y="4"
      width="16"
      height="16"
      rx="3"
      stroke="#000000"
      stroke-opacity="0.4"
      stroke-width="2"
      fill="none"
      class="plus-rect-stroke"
    />
    
    <rect
      v-else
      x="4"
      y="4"
      width="16"
      height="16"
      rx="3"
      fill="#000000"
      fill-opacity="1"
      class="plus-rect-fill"
    />
    

    <path
      d="M12 8V16M8 12H16"
      :stroke="isActive ? '#FFFFFF' : '#000000'"
      :stroke-opacity="isActive ? '1' : '0.4'"
      stroke-width="2"
      stroke-linecap="round"
      class="plus-path"
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
  
  .plus-rect-stroke,
  .plus-rect-fill,
  .plus-path {
    transition: all 0.2s ease;
  }
}
</style>