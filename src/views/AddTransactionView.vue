<script setup lang="ts">
import TransactionBodyComponent from '@/components/TransactionBodyComponent.vue'
import TopNav from '@/components/Navs/TopNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import BottomNav from '@/components/Navs/BottomNav.vue'
</script>

<template>
  <AsideNav></AsideNav>
  <TransactionBodyComponent></TransactionBodyComponent>
  <BottomNav class="mobile-only" />
</template>
