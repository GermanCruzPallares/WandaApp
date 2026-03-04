<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useTransactionSplitStore } from '@/stores/TransactionSplitStore'
import { useAccountStore } from '@/stores/AccountStore'
import BottomNav from '@/components/Navs/BottomNav.vue'
import TopNav from '@/components/Navs/TopNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import SharedTransactionDeleteModal from '@/components/Modals/SharedTransactionDeleteModal.vue'
import AccountsComponent from '@/components/Profile/AccountsComponent.vue'
import BudgetComponent from '@/components/Profile/BudgetComponent.vue'
import ObjContribution from '@/components/Profile/ObjContribution.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import TransactionCard from '@/components/HomeApp/TransactionCard.vue'
import { useToast } from '@/composables/useToast'
import type { AccountUI, Transaction, TransactionSplit, User } from '@/types/models'

const router = useRouter()
const userStore = useUserStore()
const transactionStore = useTransactionStore()
const splitStore = useTransactionSplitStore()
const accountStore = useAccountStore()
const { showToast } = useToast()

// ==================== COMPUTED ====================

const currentUser = computed(() => userStore.currentUser)

const accounts = computed<AccountUI[]>(() => {
  return userStore.accounts.map((account) => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId,
  }))
})

const activeAccount = computed(() => {
  return accounts.value.find((acc) => acc.isActive)
})

const isJoint = computed(() => activeAccount.value?.account_type === 'joint')

// ==================== ESTADO LOCAL ====================

const activeMenuItem = ref('perfil')
const allTransactions = ref<Transaction[]>([])
const members = ref<User[]>([])
const splits = ref<TransactionSplit[]>([])
const isLoadingTransactions = ref(false)

// Controles "Ver más / Ver menos"
const showAllExpenses = ref(false)
const showAllIncomes = ref(false)

const showDeleteModal = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeleting = ref(false)

// ==================== TRANSACCIONES FRECUENTES ====================

const recurringExpenses = computed(() =>
  allTransactions.value.filter((t) => t.isRecurring && t.transaction_type === 'expense'),
)

const recurringIncomes = computed(() =>
  allTransactions.value.filter((t) => t.isRecurring && t.transaction_type === 'income'),
)

const displayedExpenses = computed(() =>
  showAllExpenses.value ? recurringExpenses.value : recurringExpenses.value.slice(0, 2),
)

const displayedIncomes = computed(() =>
  showAllIncomes.value ? recurringIncomes.value : recurringIncomes.value.slice(0, 2),
)

const canShowMoreExpenses = computed(() => recurringExpenses.value.length > 2)
const canShowMoreIncomes = computed(() => recurringIncomes.value.length > 2)

// ==================== SPLITS ====================

const getSplitsForTransaction = (transactionId: number): TransactionSplit[] => {
  return splits.value.filter((s) => s.transaction_id === transactionId)
}

// ==================== CARGA DE DATOS ====================

const loadRecurringData = async (accountId: number) => {
  isLoadingTransactions.value = true

  try {
    allTransactions.value = await transactionStore.fetchTransactions(accountId)

    if (isJoint.value) {
      const [fetchedMembers, fetchedSplits] = await Promise.all([
        accountStore.fetchAccountMembers(accountId),
        splitStore.fetchAccountSplits(accountId),
      ])
      members.value = fetchedMembers
      splits.value = fetchedSplits
    } else {
      members.value = []
      splits.value = []
    }
  } catch (error) {
    console.error('Error cargando transacciones recurrentes:', error)
    allTransactions.value = []
  }

  isLoadingTransactions.value = false
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
      return
    }
  }

  if (activeAccount.value?.account_id) {
    loadRecurringData(activeAccount.value.account_id)
  }
})

watch(
  () => activeAccount.value?.account_id,
  (newId) => {
    if (newId) {
      showAllExpenses.value = false
      showAllIncomes.value = false
      loadRecurringData(newId)
    }
  },
)

// ==================== HANDLERS ====================

const handleTransactionClick = (transaction: Transaction) => {
  if (transaction.split_type === 'divided') {
    transactionToDelete.value = transaction
    showDeleteModal.value = true
  } else {
    router.push(`/edit-transaction/${transaction.transaction_id}`)
  }
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

  <main class="profile-content">
    <div class="profile-content__header">
      <AccountsComponent />
    </div>

    <div class="profile-content__grid">
      <div class="profile-content__left">
        <BudgetComponent v-if="activeAccount" :account-id="activeAccount.account_id" />

        <ObjContribution v-if="activeAccount" :account-id="activeAccount.account_id" />
      </div>

      <div class="profile-content__right">
        <!-- Gastos Frecuentes -->
        <div v-if="!isLoadingTransactions" class="profile-recurring">
          <SectionTitle :title="`| Gastos Frecuentes (${recurringExpenses.length})`" />

          <div class="profile-recurring__list">
            <TransactionCard
              v-for="transaction in displayedExpenses"
              :key="transaction.transaction_id"
              :transaction="transaction"
              :is-joint="isJoint"
              :members="members"
              :splits="getSplitsForTransaction(transaction.transaction_id)"
              @click="handleTransactionClick"
            />

            <div v-if="recurringExpenses.length === 0" class="profile-recurring__empty">
              <p>No hay gastos frecuentes registrados</p>
            </div>

            <button
              v-if="canShowMoreExpenses"
              class="profile-recurring__toggle-btn"
              @click="showAllExpenses = !showAllExpenses"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  :d="showAllExpenses ? 'M19 15l-7-7-7 7' : 'M19 9l-7 7-7-7'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ showAllExpenses ? 'Ver menos' : 'Ver más' }}
            </button>
          </div>
        </div>

        <!-- Ingresos Frecuentes -->
        <div v-if="!isLoadingTransactions" class="profile-recurring">
          <SectionTitle :title="`| Ingresos Frecuentes (${recurringIncomes.length})`" />

          <div class="profile-recurring__list">
            <TransactionCard
              v-for="transaction in displayedIncomes"
              :key="transaction.transaction_id"
              :transaction="transaction"
              :is-joint="isJoint"
              :members="members"
              :splits="getSplitsForTransaction(transaction.transaction_id)"
              @click="handleTransactionClick"
            />

            <div v-if="recurringIncomes.length === 0" class="profile-recurring__empty">
              <p>No hay ingresos frecuentes registrados</p>
            </div>

            <button
              v-if="canShowMoreIncomes"
              class="profile-recurring__toggle-btn"
              @click="showAllIncomes = !showAllIncomes"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  :d="showAllIncomes ? 'M19 15l-7-7-7 7' : 'M19 9l-7 7-7-7'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ showAllIncomes ? 'Ver menos' : 'Ver más' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

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
@import '@/styles/base/variables.scss';

.profile-content {
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 80px;

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
    gap: 20px;

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
  }
}

// ==================== SECCIONES RECURRENTES ====================

.profile-recurring {
  &__list {
    display: flex;
    flex-direction: column;
    gap: $section-gap;
    padding: 0 $section-margin-horizontal;
  }

  &__empty {
    padding: 40px 20px;
    text-align: center;
    color: $color-text-gray;

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 12px;
    margin-top: 0.5rem;
    background-color: transparent;
    border: none;
    color: $color-text-gray;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: color $transition-speed $transition-ease;

    svg {
      transition: transform $transition-speed $transition-ease;
    }

    &:hover {
      color: $color-text;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
