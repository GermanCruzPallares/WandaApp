<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import BottomNav from '@/components/Navs/BottomNav.vue'
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue'
import CardComponent from '@/components/HomeApp/CardComponent.vue'
import JointCardComponent from '@/components/HomeApp/JointCardComponent.vue'
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue'
import TransactionsHistoryComponent from '@/components/HomeApp/TransactionsHistoryComponent.vue'
import TopNav from '@/components/Navs/TopNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import SharedTransactionDeleteModal from '@/components/Modals/SharedTransactionDeleteModal.vue'
import InfoModal from '@/components/Modals/InfoModal.vue'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useToast } from '@/composables/useToast'
import type { AccountUI, Transaction, Objective } from '@/types/models'

const router = useRouter()
const userStore = useUserStore()
const transactionStore = useTransactionStore()
const { showToast } = useToast()

// ==================== COMPUTED ====================

const accounts = computed<AccountUI[]>(() => {
  return userStore.accounts.map((account) => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId,
  }))
})

const activeAccount = computed(() => {
  return accounts.value.find((acc) => acc.isActive)
})

const isJointAccount = computed(() => activeAccount.value?.account_type === 'joint')

// ==================== ESTADO LOCAL ====================

const objectives = ref<Objective[]>([])
const transactions = ref<Transaction[]>([])
const activeMenuItem = ref('inicio')

const showDeleteModal = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeleting = ref(false)

const showInfoModal = ref(false)
const infoModalTitle = ref('')
const infoModalContent = ref('')

// ==================== HELPERS ====================

const MIRROR_PREFIXES = ['(Gasto Compartido)', '(Aportación Conjunta)', '(Aportacion Conjunta)']

const isMirrorTransaction = (transaction: Transaction): boolean => {
  const concept = transaction.concept ?? ''
  return MIRROR_PREFIXES.some(prefix => concept.startsWith(prefix))
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId)
    } catch (error) {
      console.error('Error cargando datos:', error)
      router.push('/login')
    }
  }
})

// ==================== HANDLERS ====================

const handleObjectivesLoaded = (loadedObjectives: Objective[]) => {
  objectives.value = loadedObjectives
}

const handleTransactionsLoaded = (loadedTransactions: Transaction[]) => {
  transactions.value = loadedTransactions
}

const handleEditCard = () => {
  console.log('Editar tarjeta')
}

const handleAddObjective = () => {
  console.log('Añadir objetivo')
}

const handleTransactionClick = (transaction: Transaction) => {
  if (isMirrorTransaction(transaction)) {
    infoModalTitle.value = 'Transacción no editable'
    infoModalContent.value = 'Esta transacción es un reflejo automático de un gasto realizado en tu cuenta conjunta. Para modificarla, edita la transacción original desde la cuenta conjunta.'
    showInfoModal.value = true
    return
  }

  if (transaction.split_type === 'divided') {
    transactionToDelete.value = transaction
    showDeleteModal.value = true
    return
  }

  router.push(`/edit-transaction/${transaction.transaction_id}`)
}

const handleSettledClick = () => {
  infoModalTitle.value = 'Transacción bloqueada'
  infoModalContent.value = 'Esta transacción no puede eliminarse porque uno o más miembros ya han pagado su parte de la deuda asociada.'
  showInfoModal.value = true
}

const confirmDeleteTransaction = async () => {
  if (!transactionToDelete.value) return

  isDeleting.value = true
  try {
    const success = await transactionStore.deleteTransaction(
      transactionToDelete.value.transaction_id,
    )
    if (success) {
      showToast('Transacción eliminada con éxito', 'success')
      if (activeAccount.value?.account_id) {
        await transactionStore.fetchTransactions(activeAccount.value.account_id)
        window.location.reload()
      }
    } else {
      showToast('No se pudo eliminar la transacción', 'error')
    }
  } catch (error) {
    showToast('Error al intentar eliminar', 'error')
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
    transactionToDelete.value = null
  }
}
</script>

<template>
  <AsideNav :active-item="activeMenuItem" :account-id="activeAccount?.account_id" />

  <TopNav :account-id="activeAccount?.account_id" class="mobile-only" />

  <main class="home-content">
    <div class="home-content__header">
      <JointCardComponent
        v-if="isJointAccount && activeAccount?.account_id"
        :account-id="activeAccount.account_id"
      />
      <CardComponent v-else :account-id="activeAccount?.account_id" @edit="handleEditCard" />
    </div>

    <div class="home-content__grid">
      <div class="home-content__left">
        <BalanceComponent :account-id="activeAccount?.account_id" />

        <ObjectivesComponent
          v-if="activeAccount?.account_id"
          :account-id="activeAccount?.account_id"
          @add-objective="handleAddObjective"
          @objectives-loaded="handleObjectivesLoaded"
        />
      </div>

      <div class="home-content__right">
        <TransactionsHistoryComponent
          :account-id="activeAccount?.account_id"
          :account-type="activeAccount?.account_type"
          :initial-limit="5"
          :load-more-increment="10"
          @transaction-click="handleTransactionClick"
          @settled-transaction-click="handleSettledClick"
          @transactions-loaded="handleTransactionsLoaded"
        />
      </div>
    </div>
  </main>

  <InfoModal
    :is-open="showInfoModal"
    :title="infoModalTitle"
    :content="infoModalContent"
    @close="showInfoModal = false"
  />

  <SharedTransactionDeleteModal
    :is-open="showDeleteModal"
    :transaction="transactionToDelete"
    :is-deleting="isDeleting"
    @close="showDeleteModal = false"
    @confirm="confirmDeleteTransaction"
  />

  <BottomNav class="mobile-only" />
</template>

<style scoped lang="scss">
.home-content {
  min-height: 100vh;
  padding-top: calc(115px + env(safe-area-inset-top));
  padding-bottom: 100px;

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