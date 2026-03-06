<template>
  <div class="book-page">
    <AsideNav :active-item="'libro'" :account-id="activeAccount?.account_id" />

    <TopNav :account-id="activeAccount?.account_id" class="mobile-only" />

    <main class="book-content">
      <div class="book-content__section">
        <MonthSelectorComponent v-model="selectedPeriod" />
      </div>

      <div class="book-content__section">
        <MonthlySummaryComponent :income="monthlyIncome" :expense="monthlyExpense" :is-loading="isLoading" />
      </div>

      <div class="book-content__section">
        <TransactionFilterComponent v-model:filters="activeFilters" />
      </div>

      <div class="book-content__section">
        <TransactionTableComponent :transactions="monthTransactions" :filters="activeFilters" :is-loading="isLoading"
          :is-joint="activeAccount?.account_type === 'joint'" :members="accountMembers" :splits="monthSplits"
          :member-avatars="memberAvatars" @row-click="handleRowClick" />
      </div>
    </main>

    <InfoModal
      :is-open="showInfoModal"
      :title="infoModalTitle"
      :content="infoModalContent"
      @close="showInfoModal = false"
    />

    <SharedTransactionDeleteModal :is-open="showDeleteModal" :transaction="transactionToDelete"
      :is-deleting="isDeleting" @close="showDeleteModal = false" @confirm="confirmDeleteTransaction" />

    <BottomNav class="mobile-only" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useTransactionSplitStore } from '@/stores/TransactionSplitStore'
import { useAccountStore } from '@/stores/AccountStore'
import TopNav from '@/components/Navs/TopNav.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import SharedTransactionDeleteModal from '@/components/Modals/SharedTransactionDeleteModal.vue'
import InfoModal from '@/components/Modals/InfoModal.vue'
import BottomNav from '@/components/Navs/BottomNav.vue'
import MonthSelectorComponent from '@/components/BookView/MonthlySelectorComponent.vue'
import MonthlySummaryComponent from '@/components/BookView/MonthlySummaryComponent.vue'
import TransactionFilterComponent from '@/components/BookView/TransactionFilterComponent.vue'
import type { TransactionFilters } from '@/components/BookView/TransactionFilterComponent.vue'
import TransactionTableComponent from '@/components/BookView/TransactionTableComponent.vue'
import { useToast } from '@/composables/useToast'
import type { Transaction, TransactionSplit, AccountUI, User } from '@/types/models'
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons'

const router = useRouter()
const userStore = useUserStore()
const transactionStore = useTransactionStore()
const splitStore = useTransactionSplitStore()
const accountStore = useAccountStore()
const { showToast } = useToast()

// ==================== ESTADO ====================

const now = new Date()
const selectedPeriod = ref({ month: now.getMonth(), year: now.getFullYear() })
const isLoading = ref(false)
const allTransactions = ref<Transaction[]>([])
const accountMembers = ref<User[]>([])
const allSplits = ref<TransactionSplit[]>([])
const memberAvatars = ref<Map<number, string>>(new Map())

const activeFilters = ref<TransactionFilters>({
  search: '',
  types: [],
  categories: [],
  minAmount: null,
  maxAmount: null,
  onlyRecurring: null,
})

const showDeleteModal = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeleting = ref(false)

const showInfoModal = ref(false)
const infoModalTitle = ref('')
const infoModalContent = ref('')

// ==================== HELPERS ====================

const MIRROR_PREFIXES = ['(Gasto Compartido)', '(Aportación Conjunta)', '(Aportacion Conjunta)']

const isMirrorTransaction = (transaction: Transaction): boolean =>
  MIRROR_PREFIXES.some(prefix => (transaction.concept ?? '').startsWith(prefix))

// ==================== COMPUTED ====================

const accounts = computed<AccountUI[]>(() =>
  userStore.accounts.map((account) => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId,
  })),
)

const activeAccount = computed(() => accounts.value.find((acc) => acc.isActive))

const monthTransactions = computed<Transaction[]>(() => {
  const { month, year } = selectedPeriod.value
  return allTransactions.value.filter((t) => {
    const d = new Date(t.transaction_date)
    return d.getMonth() === month && d.getFullYear() === year
  })
})

const monthSplits = computed<TransactionSplit[]>(() => {
  const ids = new Set(monthTransactions.value.map((t) => t.transaction_id))
  return allSplits.value.filter((s) => ids.has(s.transaction_id))
})

const monthlyIncome = computed(() =>
  monthTransactions.value
    .filter((t) => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0),
)

const monthlyExpense = computed(() =>
  monthTransactions.value
    .filter((t) => t.transaction_type === 'expense' || t.transaction_type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0),
)

// ==================== MÉTODOS ====================

const loadTransactions = async (accountId: number) => {
  isLoading.value = true
  try {
    allTransactions.value = await transactionStore.fetchTransactions(accountId)

    if (activeAccount.value?.account_type === 'joint') {
      allSplits.value = await splitStore.fetchAccountSplits(accountId)
      accountMembers.value = await accountStore.fetchAccountMembers(accountId)

      const avatarMap = new Map<number, string>()
      await Promise.all(
        accountMembers.value.map(async (member) => {
          const userAccounts = await userStore.fetchUserAccounts(member.user_id)
          const personalAccount = userAccounts.find(a => a.account_type === 'personal')
          avatarMap.set(
            member.user_id,
            personalAccount?.account_picture_url || getAvatarDataUrl('personal')
          )
        })
      )
      memberAvatars.value = avatarMap
    } else {
      allSplits.value = []
      memberAvatars.value = new Map()
    }
  } catch (error) {
    console.error('❌ Error cargando transacciones:', error)
  } finally {
    isLoading.value = false
  }
}

const handleRowClick = (transaction: Transaction) => {
  if (isMirrorTransaction(transaction)) {
    infoModalTitle.value = 'Transacción no editable'
    infoModalContent.value = 'Esta transacción es un reflejo automático de un gasto realizado en tu cuenta conjunta. Para modificarla, edita la transacción original desde la cuenta conjunta.'
    showInfoModal.value = true
    return
  }

  if (transaction.split_type === 'divided') {
    const txSplits = allSplits.value.filter(s => s.transaction_id === transaction.transaction_id)
    if (txSplits.some(s => s.status === 'settled')) {
      infoModalTitle.value = 'Transacción bloqueada'
      infoModalContent.value = 'Esta transacción no puede eliminarse porque uno o más miembros ya han pagado su parte de la deuda asociada.'
      showInfoModal.value = true
      return
    }
    transactionToDelete.value = transaction
    showDeleteModal.value = true
    return
  }

  router.push({ name: 'edit-transaction', params: { id: transaction.transaction_id } })
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
        await loadTransactions(activeAccount.value.account_id)
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

// ==================== LIFECYCLE ====================

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId)
    } catch {
      router.push('/login')
    }
  }

  if (activeAccount.value?.account_id) {
    loadTransactions(activeAccount.value.account_id)
  }
})

watch(
  () => `${selectedPeriod.value.month}-${selectedPeriod.value.year}`,
  () => {
    activeFilters.value = {
      search: '',
      types: [],
      categories: [],
      minAmount: null,
      maxAmount: null,
      onlyRecurring: null,
    }
  }
)

watch(
  () => activeAccount.value?.account_id,
  (newId) => {
    if (newId) loadTransactions(newId)
  },
)
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.book-page {
  min-height: 100vh;
  background-color: $background-principal;
}

.book-content {
  padding-top: calc(115px + env(safe-area-inset-top));
  padding-bottom: 110px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 16px;
  padding-right: 16px;

  @media (min-width: 768px) {
    margin-left: $aside-nav-width;
    width: calc(100% - #{$aside-nav-width});
    padding: 40px 40px;
  }

  &__title {
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: $color-text;
      margin: 0 0 8px;
    }
  }

  &__section {
    width: 100%;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}

.desktop-only {
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
}
</style>