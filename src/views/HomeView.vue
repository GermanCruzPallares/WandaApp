<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import BottomNav from '@/components/Navs/BottomNav.vue'
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue'
import CardComponent from '@/components/HomeApp/CardComponent.vue'
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue'
import TransactionsHistoryComponent from '@/components/HomeApp/TransactionsHistoryComponent.vue'
import TopNav from '@/components/Navs/TopNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import type { AccountUI, Transaction, Objective } from '@/types/models'

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
  console.log('🔍 HomeView: activeAccount =', active)
  return active
})

// ==================== ESTADO LOCAL ====================

const objectives = ref<Objective[]>([])
const transactions = ref<Transaction[]>([])
const activeMenuItem = ref('inicio')

// ==================== LIFECYCLE ====================

onMounted(async () => {
  // Verificar autenticación
  if (!userStore.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo a login...')
    router.push('/login')
    return
  }

  // Si el store no tiene datos cargados, cargarlos
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

const handleObjectivesLoaded = (loadedObjectives: Objective[]) => {
  console.log('🎯 HomeView: Objetivos recibidos:', loadedObjectives)
  objectives.value = loadedObjectives
}

const handleTransactionsLoaded = (loadedTransactions: Transaction[]) => {
  console.log('💳 HomeView: Transacciones recibidas:', loadedTransactions.length)
  transactions.value = loadedTransactions
}

const handleEditCard = () => {
  console.log('Editar tarjeta')
}

const handleAddObjective = () => {
  console.log('Añadir objetivo')
}

const handleTransactionClick = (transactionId: number) => {
  console.log('Transacción clickeada:', transactionId)
}
</script>

<template>
  <div class="app-shell">
    <AsideNav :active-item="activeMenuItem" :account-id="activeAccount?.account_id" />

    <TopNav :account-id="activeAccount?.account_id" class="mobile-only" />

    <main class="home-content">
      <div class="home-content__header">
        <CardComponent
          :account-id="activeAccount?.account_id"
          :user-name="currentUser?.name"
          @edit="handleEditCard"
        />
      </div>

      <div class="home-content__grid">
        <div class="home-content__left">
          <BalanceComponent :account-id="activeAccount?.account_id" />

          <ObjectivesComponent
            :account-id="activeAccount?.account_id"
            @add-objective="handleAddObjective"
            @objectives-loaded="handleObjectivesLoaded"
          />
        </div>

        <div class="home-content__right">
          <TransactionsHistoryComponent
            :account-id="activeAccount?.account_id"
            :initial-limit="5"
            :load-more-increment="10"
            @transaction-click="handleTransactionClick"
            @transactions-loaded="handleTransactionsLoaded"
          />
        </div>
      </div>
    </main>

    <BottomNav class="mobile-only" />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  background-color: $background-principal;
}

.home-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px; // Standard internal spacing

  @media (min-width: 768px) {
    margin-left: 240px;
    padding: 40px 20px;
    max-width: calc(100vw - 240px);
  }

  &__header {
    width: 100%;
    margin-bottom: 20px;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 0;

    @media (min-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }
  }

  &__left,
  &__right {
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (min-width: 768px) {
      gap: 20px;
    }
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
