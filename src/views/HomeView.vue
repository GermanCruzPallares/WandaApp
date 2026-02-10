<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue';
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue';
import TopNav from '@/components/TopNav.vue';
import { ref } from 'vue';


const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay(); 
  return day === 0 ? 6 : day - 1;
};

const currentDay = getCurrentDayOfWeek();


const objectives = ref([
  {
    id: '1',
    name: 'Coche nuevo',
    icon: 'car',
    currentAmount: 7000,
    targetAmount: 10000,
    progress: 70
  },
  {
    id: '2',
    name: 'Entrada Casa',
    icon: 'home',
    currentAmount: 3756,
    targetAmount: 20000,
    progress: 20
  }
]);

const handleAddObjective = () => {
  console.log('Añadir nuevo objetivo');
  // Aquí puedes abrir un modal o navegar a otra vista
};

const handleShowInfo = (id: string) => {
  console.log('Mostrar info del objetivo:', id);
  // Aquí puedes mostrar detalles del objetivo
};

</script>

<template>
<TopNav></TopNav>
<main class="home-content">
<CardComponent></CardComponent>
<BalanceComponent
:weekly-budget="200"
:current-week-expenses="10"
:today-day-of-week= "currentDay"
></BalanceComponent>
<ObjectivesComponent
      :objectives="objectives"
      @add-objective="handleAddObjective"
      @show-info="handleShowInfo"
    ></ObjectivesComponent>
</main>
<BottomNav></BottomNav>

</template>

<style scoped>
.home-content {

  padding-top: 100px; 
  padding-bottom: 80px; 
}
</style>