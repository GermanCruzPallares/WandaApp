<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ active: isActive }"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      :stroke="isActive ? '#000000' : '#000000'"
      :stroke-opacity="isActive ? '1' : '0.4'"
      stroke-width="2"
      fill="none"
    />
    <circle
      cx="12"
      cy="10"
      r="3"
      :fill="isActive ? '#000000' : '#000000'"
      :fill-opacity="isActive ? '1' : '0.4'"
    />
    <path
      d="M6.5 18.5C7 16 9 14.5 12 14.5C15 14.5 17 16 17.5 18.5"
      :stroke="isActive ? '#000000' : '#000000'"
      :stroke-opacity="isActive ? '1' : '0.4'"
      stroke-width="2"
      stroke-linecap="round"
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
  
  circle, path {
    transition: fill-opacity 0.2s ease, stroke-opacity 0.2s ease;
  }
  
  &:hover {
    circle, path {
      fill-opacity: 0.6 !important;
      stroke-opacity: 0.6 !important;
    }
  }
}
</style>