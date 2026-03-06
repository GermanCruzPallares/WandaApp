<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToastNotification from './components/ToastNotification.vue'
</script>

<template>
  <ToastNotification />
  <RouterView />
</template>
