<script setup lang="ts">
import AdminAsidenav from '@/components/Admin/AdminAsidenav.vue';
import TopNav from '@/components/Navs/TopNav.vue';

</script>

<template>

<AdminAsidenav></AdminAsidenav>
<TopNav 
    class="mobile-only"
/>


</template>

<style scoped lang="scss">

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>