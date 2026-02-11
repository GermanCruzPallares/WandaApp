
<template>
<div class="objective-contributions-page">
    <!-- AsideNav para desktop -->
    <AsideNav 
      :active-item="activeMenuItem"
      :accounts="accounts"
      @navigate="handleNavigate"
      @avatar-click="handleAvatarClick"
    />

    <!-- Header con navegación (solo móvil) -->
    <HeaderNav 
      title="Historial de Aportaciones" 
      @back="handleBack"
      class="mobile-only"
    />

    <!-- Título para desktop -->
    <div class="desktop-header">
      <h1 class="page-title">Historial de Aportaciones</h1>
    </div>

    <!-- Contenido principal -->
    <main class="contributions-content">
      <ContributionHistory
        :objectives="objectives"
        :contributions="contributions"
        @contribution-click="handleContributionClick"
      />
    </main>

    <!-- Bottom Nav solo en móvil -->
    <BottomNav class="mobile-only" />

    <!-- Modal de cambio de cuenta -->
    <AccountSwitcherModal
      :is-open="isAccountModalOpen"
      :accounts="accounts"
      @close="handleCloseModal"
      @select-account="handleSelectAccount"
      @add-account="handleAddAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import HeaderNav from '@/components/HeaderNav.vue';
import ContributionHistory from '@/components/ContributionHistory.vue';
import BottomNav from '@/components/BottomNav.vue';
import AsideNav from '@/components/AsideNav.vue';
import AccountSwitcherModal from '@/components/AccountSwitcherModal.vue';
import type { Objective, Contribution } from '@/components/ContributionHistory.vue';
import type { Account } from '@/components/AsideNav.vue';

const router = useRouter();

// Estado del menú
const activeMenuItem = ref('libro'); // O el que corresponda

// Estado de cuentas
const accounts = ref<Account[]>([
  {
    id: '1',
    name: 'Clara',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isActive: true
  },
]);

const isAccountModalOpen = ref(false);

// Datos de ejemplo de objetivos (vendrán del backend)
const objectives = ref<Objective[]>([
  {
    objective_id: 1,
    account_id: 1,
    name: 'Coche nuevo',
    target_amount: 10000,
    current_save: 7500,
    deadline: new Date(2026, 11, 31),
    objective_picture_url: ''
  },
  {
    objective_id: 2,
    account_id: 1,
    name: 'Casa nuevo',
    target_amount: 50000,
    current_save: 15000,
    deadline: new Date(2028, 5, 30),
    objective_picture_url: ''
  },
  {
    objective_id: 3,
    account_id: 1,
    name: 'Vacaciones',
    target_amount: 3000,
    current_save: 1200,
    deadline: new Date(2026, 6, 15),
    objective_picture_url: ''
  }
]);

// Datos de ejemplo de aportaciones (vendrán del backend)
const contributions = ref<Contribution[]>([
  {
    id: 1,
    objective_id: 1,
    objective_name: 'Coche nuevo',
    amount: 500,
    date: new Date(2026, 0, 10, 10, 30)
  },
  {
    id: 2,
    objective_id: 2,
    objective_name: 'Casa nuevo',
    amount: 500,
    date: new Date(2026, 0, 10, 15, 45)
  },
  {
    id: 3,
    objective_id: 1,
    objective_name: 'Coche nuevo',
    amount: 500,
    date: new Date(2026, 0, 9, 9, 20)
  },
  {
    id: 4,
    objective_id: 1,
    objective_name: 'Coche nuevo',
    amount: 500,
    date: new Date(2026, 0, 8, 14, 10)
  },
  {
    id: 5,
    objective_id: 3,
    objective_name: 'Vacaciones',
    amount: 200,
    date: new Date(2026, 0, 8, 11, 30)
  },
  {
    id: 6,
    objective_id: 2,
    objective_name: 'Casa nuevo',
    amount: 1000,
    date: new Date(2026, 0, 5, 16, 20)
  },
  {
    id: 7,
    objective_id: 1,
    objective_name: 'Coche nuevo',
    amount: 300,
    date: new Date(2026, 0, 3, 12, 0)
  },
  {
    id: 8,
    objective_id: 3,
    objective_name: 'Vacaciones',
    amount: 150,
    date: new Date(2026, 0, 2, 10, 15)
  },
  {
    id: 9,
    objective_id: 2,
    objective_name: 'Casa nuevo',
    amount: 750,
    date: new Date(2025, 11, 28, 9, 45)
  },
  {
    id: 10,
    objective_id: 1,
    objective_name: 'Coche nuevo',
    amount: 600,
    date: new Date(2025, 11, 25, 14, 30)
  }
]);

// Funciones de navegación
const handleBack = () => {
  router.back();
};

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  console.log('Navegando a:', itemId);
  // Aquí añadirás la navegación con vue-router
  if (itemId === 'inicio') {
    router.push('/');
  }
};

const handleContributionClick = (contributionId: number) => {
  console.log('Aportación clickeada:', contributionId);
};

// Funciones de cuenta
const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};

const handleCloseModal = () => {
  isAccountModalOpen.value = false;
};

const handleSelectAccount = (accountId: string) => {
  accounts.value = accounts.value.map(acc => ({
    ...acc,
    isActive: acc.id === accountId
  }));
  console.log('Cuenta seleccionada:', accountId);
};

const handleAddAccount = () => {
  console.log('Añadir nueva cuenta');
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.objective-contributions-page {
  min-height: 100vh;
  background-color: $background-principal;
}

.desktop-header {
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-left: 240px;
    padding: 32px 32px 0;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: $color-text;
  margin: 0 0 24px 0;
}

.contributions-content {
  padding-top: 7em; 
  padding-bottom: 80px; 
  min-height: 100vh;

  @media (min-width: 768px) {
    margin-left: 240px;
    padding-top: 20px; 
    padding-bottom: 40px;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>