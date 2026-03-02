<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import HeaderNav from '@/components/Navs/HeaderNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import EditAccountForm from '@/components/EditAccount/EditAccountForm.vue'
import type { AccountUI, Account } from '@/types/models'

const router = useRouter()
const userStore = useUserStore()

// ==================== COMPUTED ====================

// Usuario actual desde el store
const currentUser = computed(() => userStore.currentUser)

// Cuentas con formato AccountUI (agregando isActive)
const accounts = computed<AccountUI[]>(() => {
  return userStore.accounts.map((account) => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId,
  }))
})

// Cuenta activa
const activeAccount = computed(() => {
  const active = accounts.value.find((acc) => acc.isActive)
  console.log('🔍 EditAccountView: activeAccount =', active)
  return active
})

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo a login...')
    router.push('/login')
    return
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId)
    } catch (error) {
      console.error('❌ Error cargando datos:', error)
      router.push('/login')
    }
  }
})

// ==================== HANDLERS ====================

const handleBack = () => router.push('/home')

const handleSaved = (account: Account) => {
  console.log('✅ Cuenta guardada:', account)
  // Redirigir a home después de guardar
  router.push('/home')
}

const handleCancelled = () => {
  console.log('❌ Edición cancelada')
  router.push('/home')
}

const activeMenuItem = ref('inicio')
</script>

<template>
  <div class="editAccount-page">
    <AsideNav :active-item="activeMenuItem" :account-id="activeAccount?.account_id" />

    <HeaderNav title="Editar Cuenta" @back="handleBack" class="mobile-only" />

    <!-- Formulario de edición -->
    <main class="edit-account-content">
      <EditAccountForm
        v-if="activeAccount?.account_id"
        :account-id="activeAccount.account_id"
        @saved="handleSaved"
        @cancelled="handleCancelled"
      />

      <div v-else class="loading-container">
        <p>Cargando datos de la cuenta...</p>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.editAccount-page {
  min-height: 100vh;
  background-color: $background-principal;
  display: flex;
  flex-direction: column;
}

.edit-account-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
  padding-bottom: 20px;

  @media (min-width: 768px) {
    margin-left: 240px;
    min-height: 100vh;
  }
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: $color-text-gray;
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
