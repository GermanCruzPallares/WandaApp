<script setup lang="ts">
import { ref } from 'vue';
import BottomNav from '@/components/BottomNav.vue';
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue';
import TopNav from '@/components/TopNav.vue';
import AccountSwitcherModal from '@/components/AccountSwitcherModal.vue';
import type { Account } from '@/components/TopNav.vue';

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
    currentAmount: 7000,
    targetAmount: 10000,
    progress: 70
  },
  {
    id: '2',
    name: 'Entrada Casa',
    currentAmount: 3756,
    targetAmount: 20000,
    progress: 20
  }
]);

// Estado del modal
const isAccountModalOpen = ref(false);

// Cuentas del usuario (esto vendrá de un fetch)
const accounts = ref<Account[]>([
  {
    id: '1',
    name: 'Clara',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isActive: true
  },
  // Aquí añadirás más cuentas cuando vengan del servidor
]);

const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};

const handleCloseModal = () => {
  isAccountModalOpen.value = false;
};

const handleSelectAccount = (accountId: string) => {
  // Actualizar la cuenta activa
  accounts.value = accounts.value.map(acc => ({
    ...acc,
    isActive: acc.id === accountId
  }));
  
  // Aquí harías el fetch para cargar los datos de la cuenta seleccionada
  console.log('Cuenta seleccionada:', accountId);
};

const handleAddAccount = () => {
  // Aquí navegarías a la vista de añadir cuenta o abrirías otro modal
  console.log('Añadir nueva cuenta');
};
</script>

<template>
  <TopNav 
    :accounts="accounts" 
    @avatar-click="handleAvatarClick"
  />
  
  <main class="home-content">
    <CardComponent></CardComponent>
    <BalanceComponent
      :weekly-budget="200"
      :current-week-expenses="10"
      :today-day-of-week="currentDay"
    ></BalanceComponent>
    <ObjectivesComponent
      :objectives="objectives"
    ></ObjectivesComponent>
  </main>
  
  <BottomNav></BottomNav>

  <!-- Modal de cambio de cuenta -->
  <AccountSwitcherModal
    :is-open="isAccountModalOpen"
    :accounts="accounts"
    @close="handleCloseModal"
    @select-account="handleSelectAccount"
    @add-account="handleAddAccount"
  />
</template>

<style scoped>
.home-content {
  padding-top: 100px;
  padding-bottom: 80px;
}
</style>