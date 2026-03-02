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
   
    <g v-if="!isActive">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#000000"
        stroke-opacity="0.4"
        stroke-width="2"
        fill="none"
      />
      <circle
        cx="12"
        cy="10"
        r="3"
        fill="#000000"
        fill-opacity="0.4"
      />
      <path
        d="M6.5 18.5C7 16 9 14.5 12 14.5C15 14.5 17 16 17.5 18.5"
        stroke="#000000"
        stroke-opacity="0.4"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
      />
    </g>
    
    
    <g v-else>
   
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="#000000"
        fill-opacity="1"
      />
   
      <circle
        cx="12"
        cy="10"
        r="3"
        fill="#FFFFFF"
      />
      
      <path
        d="M6.5 18.5C7 16 9 14.5 12 14.5C15 14.5 17 16 17.5 18.5"
        stroke="#FFFFFF"
        stroke-width="2.5"
        stroke-linecap="round"
        fill="none"
      />
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
  
  g {
    transition: all 0.2s ease;
  }
}
</style>