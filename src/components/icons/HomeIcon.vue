<template>
  <svg
    class="home-icon"
    :class="{ active: isActive }"
    @click="toggle"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 9L12 2L21 9" />
    <path d="M9 22V12H15V22" />
  </svg>
</template>




<script setup>
import { ref } from 'vue'

const isActive = ref(false)

const toggle = () => {
  isActive.value = !isActive.value
}
</script>

<style scoped>
.home-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease;
}

.home-icon:hover {
  color: #000;
}

.home-icon.active {
  color: #42b883; /* verde Vue */
  filter: drop-shadow(0 4px 6px rgba(66, 184, 131, 0.5));
}
</style>