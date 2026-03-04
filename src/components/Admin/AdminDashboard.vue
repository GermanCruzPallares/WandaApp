<!-- src/components/Admin/AdminDashboard.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore } from '@/stores/AdminStore';
import StatCard from './StatCard.vue';
import SectionTitle from '@/components/SectionTitle.vue';

const adminStore = useAdminStore();

onMounted(async () => {
  await adminStore.fetchSystemStats();
});
</script>

<template>
  <div class="admin-dashboard">

    <div v-if="adminStore.isLoadingStats" class="admin-dashboard__loading">
      <span>Cargando estadísticas...</span>
    </div>

    <div v-else-if="adminStore.statsError" class="admin-dashboard__error">
      <span>{{ adminStore.statsError }}</span>
      <button @click="adminStore.fetchSystemStats()">Reintentar</button>
    </div>

    <!-- Content -->
    <template v-else-if="adminStore.systemStats">
      <!-- Métricas principales -->
      <section class="admin-dashboard__section">
        <SectionTitle title="| Resumen General" />
        <div class="admin-dashboard__grid admin-dashboard__grid--3">
          <StatCard title="Total Usuarios" :value="adminStore.systemStats.users.total"
            :subtitle="`${adminStore.systemStats.users.admins} admins · ${adminStore.systemStats.users.regularUsers} usuarios`"
            color="primary" />
          <StatCard title="Total Cuentas" :value="adminStore.systemStats.accounts.total"
            :subtitle="`${adminStore.systemStats.accounts.personal} personales · ${adminStore.systemStats.accounts.joint} conjuntas`"
            color="success" />
          <StatCard title="Transacciones" :value="adminStore.systemStats.financials.totalTransactions"
            subtitle="Total en el sistema" color="warning" />
        </div>
      </section>

      <!-- Desglose Usuarios -->
      <section class="admin-dashboard__section">
        <SectionTitle title="| Desglose de Usuarios" />
        <div class="admin-dashboard__grid admin-dashboard__grid--3">
          <StatCard title="Administradores" :value="adminStore.systemStats.users.admins" color="danger" />
          <StatCard title="Usuarios Regulares" :value="adminStore.systemStats.users.regularUsers" color="primary" />
          <StatCard title="Ratio Admin/Usuario"
            :value="`1:${Math.round(adminStore.systemStats.users.regularUsers / adminStore.systemStats.users.admins) || 0}`"
            color="warning" />
        </div>
      </section>

      <!-- Desglose Cuentas -->
      <section class="admin-dashboard__section">
        <SectionTitle title="| Desglose de Cuentas" />
        <div class="admin-dashboard__grid admin-dashboard__grid--3">
          <StatCard title="Cuentas Personales" :value="adminStore.systemStats.accounts.personal" color="primary" />
          <StatCard title="Cuentas Conjuntas" :value="adminStore.systemStats.accounts.joint" color="success" />
          <StatCard title="Media Trans./Cuenta"
            :value="Math.round(adminStore.systemStats.financials.totalTransactions / adminStore.systemStats.accounts.total) || 0"
            color="warning" />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.admin-dashboard {
  padding: 0 ;
  max-width: 100%;

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px;
    background-color: $color-white;
    border-radius: $card-border-radius;
    text-align: center;

    button {
      padding: 10px 20px;
      background-color: $color-text;
      color: $color-white;
      border: none;
      border-radius: $form-radius;
      cursor: pointer;
      font-weight: 500;
      transition: opacity $transition-speed $transition-ease;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  &__error {
    color: $bg-danger-text;
  }

  &__section {
    margin-bottom: 32px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 0 $section-margin-horizontal;

    @media (max-width: $breakpoint-desktop) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: $breakpoint-mobile) {
      grid-template-columns: 1fr;
    }
  }
}
</style>