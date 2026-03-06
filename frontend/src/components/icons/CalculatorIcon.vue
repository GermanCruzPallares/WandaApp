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
     
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="#000000"
        stroke-opacity="0.4"
        stroke-width="2"
        fill="none"
      />
      

      <rect
        x="7"
        y="5"
        width="10"
        height="3.5"
        rx="0.5"
        fill="#000000"
        fill-opacity="0.4"
      />
      

      <rect x="7" y="10.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      <rect x="11" y="10.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      <rect x="15" y="10.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      
      <rect x="7" y="13.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      <rect x="11" y="13.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      <rect x="15" y="13.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      
      <rect x="7" y="16.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      <rect x="11" y="16.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
      <rect x="15" y="16.5" width="2" height="2" rx="0.4" fill="#000000" fill-opacity="0.4" />
    </g>
    

    <g v-else>

      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        fill="#000000"
        fill-opacity="1"
      />
      

      <rect
        x="7"
        y="5"
        width="10"
        height="3.5"
        rx="0.5"
        fill="#FFFFFF"
      />
      
    
      <rect x="7" y="10.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      <rect x="11" y="10.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      <rect x="15" y="10.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      
      <rect x="7" y="13.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      <rect x="11" y="13.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      <rect x="15" y="13.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      
      <rect x="7" y="16.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      <rect x="11" y="16.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
      <rect x="15" y="16.5" width="2" height="2" rx="0.4" fill="#FFFFFF" />
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