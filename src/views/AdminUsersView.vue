<script setup lang="ts">
import AdminAsidenav from '@/components/Admin/AdminAsidenav.vue';
import AdminBottomnav from '@/components/Admin/AdminBottomnav.vue';
import TopNav from '@/components/Navs/TopNav.vue';
import CreateAdminForm from '@/components/Admin/CreateAdminForm.vue';
import UsersList from '@/components/Admin/UsersList.vue';
import SectionTitle from '@/components/SectionTitle.vue';
</script>

<template>
  <AdminAsidenav />
  <TopNav class="mobile-only" />

  <main class="admin-users">
    <!-- Sección Crear Admin -->
    <section class="admin-users__section">
      <SectionTitle title="| Gestión de Usuarios" />
      <div class="admin-users__form-container">
        <CreateAdminForm />
      </div>
    </section>

    <!-- Sección Lista de Usuarios -->
    <section class="admin-users__section">
      <SectionTitle title="| Usuarios Registrados" />
      <UsersList />
    </section>
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

.admin-users {
  margin-left: $aside-nav-width;
  padding: 24px;
  min-height: 100vh;
  background-color: $background-principal;

  @media (max-width: $breakpoint-mobile) {
    margin-left: 0;
    padding-top: calc($navbar-height + 16px);
    padding-bottom: 100px;
  }

  &__section {
    margin-bottom: 32px;
  }

  &__form-container {
    max-width: 600px;
    padding: 0 $section-margin-horizontal;
  }
}
</style>