<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue';
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import TopNav from '@/components/TopNav.vue';


const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay(); 
  return day === 0 ? 6 : day - 1;
};

const currentDay = getCurrentDayOfWeek();
</script>

<template>
<TopNav></TopNav>
<main class="home-content"></main>
<CardComponent></CardComponent>
<BalanceComponent
:weekly-budget="200"
:current-week-expenses="10"
:today-day-of-week= "currentDay"
></BalanceComponent>
<BottomNav></BottomNav>

</template>

<style scoped>
.home-content {

  padding-top: 100px; 
}
</style>