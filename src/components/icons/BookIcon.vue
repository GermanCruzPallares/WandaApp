<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ active: isActive }"
  >
    <rect
      x="5"
      y="4"
      width="14"
      height="16"
      rx="1"
      :stroke="isActive ? '#000000' : '#000000'"
      :stroke-opacity="isActive ? '1' : '0.4'"
      stroke-width="2"
      fill="none"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  isActive?: boolean;
}

withDefaults(defineProps<Props>(), {
  isActive: false,
});
</script>

<style scoped lang="scss">
svg {
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  rect {
    transition: stroke-opacity 0.2s ease;
  }
  
  &:hover rect {
    stroke-opacity: 0.6 !important;
  }
}
</style>