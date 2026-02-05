<script setup lang="ts">
import LoginComponent from '@/components/LoginComponent.vue'
import EnterpriseHeader from '../components/EnterpriseHeader.vue';
</script>

<template>
  <header>
    <EnterpriseHeader />
  </header>

  <body class="login">
  <main>

    <LoginComponent />
  </main>
  </body>
</template>
