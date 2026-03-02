<script setup lang="ts">
import TransactionBodyComponent from '@/components/TransactionBodyComponent.vue'
import TopNav from '@/components/Navs/TopNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import BottomNav from '@/components/Navs/BottomNav.vue'
</script>

<template>
  <div class="app-shell">
    <AsideNav />
    <TopNav class="mobile-only" />
    <main class="main-content">
      <TransactionBodyComponent />
    </main>
    <BottomNav class="mobile-only" />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh; // Full viewport height including dynamic bars
  width: 100%;
  overflow: hidden; // Prevent shell itself from scrolling
}

.main-content {
  flex: 1;
  overflow-y: auto; // Content area is the only scrollable part
  -webkit-overflow-scrolling: touch;
  background-color: #ffffff;
}

@media (min-width: 768px) {
  .app-shell {
    flex-direction: row; // Horizontal layout for desktop
    height: 100vh;
  }

  .main-content {
    background-color: $background-principal;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
