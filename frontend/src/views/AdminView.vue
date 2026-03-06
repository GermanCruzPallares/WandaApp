<script setup lang="ts">
import AdminAsidenav from '@/components/Admin/AdminAsidenav.vue';
import AdminBottomnav from '@/components/Admin/AdminBottomnav.vue';
import TopNav from '@/components/Navs/TopNav.vue';
import AdminDashboard from '@/components/Admin/AdminDashboard.vue';
</script>

<template>
  <AdminAsidenav />
  <TopNav class="mobile-only" />

  <main class="admin-content">
    <AdminDashboard />
  </main>

  <AdminBottomnav class="mobile-only" />
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}

.admin-content {
  margin-left: $aside-nav-width;
  padding: 24px;
  min-height: 100vh;
  background-color: $background-principal;

  @media (max-width: $breakpoint-mobile) {
    margin-left: 0;
    padding-top: calc($navbar-height + 16px);
    padding-bottom: 100px;
  }
}
</style>