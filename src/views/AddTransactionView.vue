<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from '@/composables/useToast'
import type { User } from '@/types/models'
import AsideNav from '@/components/Navs/AsideNav.vue'
import TopNav from '@/components/Navs/TopNav.vue'
import BottomNav from '@/components/Navs/BottomNav.vue'
import TransactionFormPanel from '@/components/TransactionFormPanel.vue'
import KeypadPanel from '@/components/KeypadPanel.vue'

const props = defineProps<{ transactionId?: number }>()

const router = useRouter()
const transactionStore = useTransactionStore()
const userStore = useUserStore()
const { showToast } = useToast()

// ─── Accounts ────────────────────────────────────────────────────────────────
const accounts = computed(() =>
  userStore.accounts.map((a) => ({ ...a, isActive: a.account_id === userStore.activeAccountId }))
)
const activeAccount = computed(() => accounts.value.find((a) => a.isActive))

// ─── Form state ──────────────────────────────────────────────────────────────
const type = ref<'expense' | 'income' | 'saving'>('expense')
const amount = ref('0')
const selectedCategory = ref<number | null>(null)
const conceptText = ref('')
const isRecurring = ref(false)
const frequency = ref<'weekly' | 'monthly' | 'annual'>('monthly')
const duration = ref<'defined' | 'indefinite'>('defined')
const endDate = ref('')
const objectiveId = ref(0)
const keypadOpen = ref(false)

// ─── Split state ──────────────────────────────────────────────────────────────
const isSplit = ref(false)
const splitMode = ref<'percentage' | '50-50' | 'amount'>('50-50')
const accountMembers = ref<User[]>([])
const splitValues = ref<Record<number, { percentage: number; amount: number }>>({})
const membersError = ref('')

// ─── Categories ──────────────────────────────────────────────────────────────
const expenseCategories = [
  { id: 1, name: 'Alimentación' }, { id: 2, name: 'Transporte' },
  { id: 3, name: 'Compras' }, { id: 4, name: 'Facturas' },
  { id: 5, name: 'Suscripciones' }, { id: 6, name: 'Ocio' },
  { id: 7, name: 'Salud' }, { id: 8, name: 'Hogar' }, { id: 9, name: 'Otros' },
]
const incomeCategories = [
  { id: 10, name: 'Salario' }, { id: 11, name: 'Freelance' },
  { id: 12, name: 'Inversión' }, { id: 13, name: 'Venta' },
]
const savingCategories = [{ id: 14, name: 'Ahorro' }]

const categories = computed(() => {
  if (type.value === 'saving') return savingCategories
  return type.value === 'expense' ? expenseCategories : incomeCategories
})

const parsedAmount = computed(() => {
  const val = parseFloat(amount.value.replace(',', '.'))
  return isNaN(val) ? 0 : val
})

// ─── Split helpers ────────────────────────────────────────────────────────────
const initializeSplits = () => {
  const count = accountMembers.value.length
  if (count === 0) return
  const pct = 100 / count
  const amt = parsedAmount.value / count
  const result: Record<number, { percentage: number; amount: number }> = {}
  accountMembers.value.forEach((m) => { result[m.user_id] = { percentage: pct, amount: amt } })
  splitValues.value = result
}

const validateSplits = () => {
  if (!isSplit.value) { membersError.value = ''; return true }
  let total = 0
  Object.values(splitValues.value).forEach((v) => { total += v.amount })
  if (Math.abs(total - parsedAmount.value) > 0.05) {
    membersError.value = '* Los importes introducidos no suman el 100% del importe.'
    return false
  }
  membersError.value = ''
  return true
}

const updateSplitValue = (userId: number, field: 'percentage' | 'amount', val: number) => {
  if (splitMode.value === '50-50') return
  const totalAmt = parsedAmount.value
  const otherIds = Object.keys(splitValues.value).map(Number).filter((id) => id !== userId)

  if (field === 'percentage') {
    const perc = Math.min(100, Math.max(0, val))
    splitValues.value[userId]!.percentage = perc
    splitValues.value[userId]!.amount = parseFloat(((perc / 100) * totalAmt).toFixed(2))
    if (otherIds.length > 0) {
      const splitPerc = (100 - perc) / otherIds.length
      otherIds.forEach((id) => {
        splitValues.value[id]!.percentage = parseFloat(splitPerc.toFixed(2))
        splitValues.value[id]!.amount = parseFloat(((splitPerc / 100) * totalAmt).toFixed(2))
      })
    }
  } else {
    const amt = Math.min(totalAmt, Math.max(0, val))
    splitValues.value[userId]!.amount = amt
    splitValues.value[userId]!.percentage = totalAmt > 0 ? parseFloat(((amt / totalAmt) * 100).toFixed(2)) : 0
    if (otherIds.length > 0) {
      const splitAmt = (totalAmt - amt) / otherIds.length
      otherIds.forEach((id) => {
        splitValues.value[id]!.amount = parseFloat(splitAmt.toFixed(2))
        splitValues.value[id]!.percentage = totalAmt > 0 ? parseFloat(((splitAmt / totalAmt) * 100).toFixed(2)) : 0
      })
    }
  }
  validateSplits()
}

watch(splitMode, (mode) => { if (mode === '50-50') initializeSplits(); validateSplits() })
watch(parsedAmount, () => {
  if (splitMode.value === '50-50') { initializeSplits(); return }
  const total = parsedAmount.value
  Object.keys(splitValues.value).forEach((id) => {
    const uid = parseInt(id)
    if (splitMode.value === 'percentage') {
      splitValues.value[uid]!.amount = parseFloat(((splitValues.value[uid]!.percentage / 100) * total).toFixed(2))
    } else {
      splitValues.value[uid]!.percentage = total > 0 ? parseFloat(((splitValues.value[uid]!.amount / total) * 100).toFixed(2)) : 0
    }
  })
  validateSplits()
})
watch(isSplit, validateSplits)
watch(activeAccount, (newAcc) => {
  if (newAcc && newAcc.account_type === 'joint') {
    userStore.getAccountUsers(newAcc.account_id).then((users) => {
      accountMembers.value = users
      initializeSplits()
    })
  } else {
    isSplit.value = false
    accountMembers.value = []
    splitValues.value = {}
  }
}, { immediate: true })

// ─── Keypad ───────────────────────────────────────────────────────────────────
const handleKeypad = (key: number | string) => {
  if (key === 'backspace') {
    amount.value = amount.value.length > 1 ? amount.value.slice(0, -1) : '0'
    return
  }
  if (amount.value === '0' && key !== ',') { amount.value = key.toString(); return }
  if (key === ',' && amount.value.includes(',')) return
  amount.value += key.toString()
}

const handleKeydown = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (!isNaN(Number(e.key)) && e.key !== ' ') handleKeypad(parseInt(e.key))
  else if (e.key === 'Backspace') handleKeypad('backspace')
  else if (e.key === ',' || e.key === '.') handleKeypad(',')
  else if (e.key === 'Enter') save()
}

// ─── Load transaction (edit mode) ────────────────────────────────────────────
const loadTransactionData = async (id: number) => {
  try {
    const trx = await transactionStore.fetchTransactionById(id)
    if (!trx) return
    if (trx.user_id !== userStore.userId) {
      showToast('No tienes permiso para acceder a esta transacción', 'error')
      router.push('/home'); return
    }
    type.value = (trx.transaction_type as 'expense' | 'income' | 'saving') || 'expense'
    objectiveId.value = trx.objective_id || 0
    amount.value = trx.amount.toString().replace('.', ',')
    const foundCat = categories.value.find((c) =>
      c.name.localeCompare(trx.category ?? '', undefined, { sensitivity: 'base' }) === 0
    )
    selectedCategory.value = foundCat ? foundCat.id : null
    conceptText.value = trx.concept && trx.concept !== trx.category ? trx.concept : ''
    isSplit.value = trx.split_type === 'divided'
    isRecurring.value = !!trx.isRecurring
    if (trx.frequency) frequency.value = trx.frequency as 'weekly' | 'monthly' | 'annual'
    if (trx.end_date) {
      duration.value = 'defined'
      endDate.value = typeof trx.end_date === 'string'
        ? trx.end_date.split('T')[0] || ''
        : new Date(trx.end_date).toISOString().split('T')[0] || ''
    } else {
      duration.value = 'indefinite'
    }
  } catch {
    showToast('No se pudo cargar la transacción', 'error')
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────
const save = async () => {
  if (!selectedCategory.value) { showToast('Por favor selecciona una categoría', 'error'); return }
  if (!activeAccount.value?.account_id) { showToast('No hay una cuenta activa seleccionada', 'error'); return }
  if (parsedAmount.value <= 0) { showToast('El monto debe ser mayor a 0', 'error'); return }
  if (isSplit.value && !validateSplits()) { showToast('Los importes introducidos no suman el 100% del importe', 'error'); return }

  const categoryName = categories.value.find((c) => c.id === selectedCategory.value)?.name || 'Varios'
  const transactionData = {
    user_id: userStore.userId!,
    objective_id: objectiveId.value,
    category: categoryName,
    amount: parsedAmount.value,
    transaction_type: type.value,
    concept: conceptText.value || categoryName,
    transaction_date: new Date().toISOString(),
    isRecurring: isRecurring.value,
    frequency: isRecurring.value ? (frequency.value === 'annual' ? ('annual' as const) : (frequency.value as 'weekly' | 'monthly')) : null,
    end_date: isRecurring.value && duration.value === 'defined' && endDate.value ? endDate.value : null,
    split_type: isSplit.value ? ('divided' as const) : ('individual' as const),
    customSplits: isSplit.value
      ? Object.keys(splitValues.value).map((uid) => ({ user_id: parseInt(uid), amount: splitValues.value[parseInt(uid)]!.amount }))
      : undefined,
  }

  try {
    const success = props.transactionId
      ? await transactionStore.updateTransaction(props.transactionId, transactionData)
      : await transactionStore.createTransaction(activeAccount.value.account_id, transactionData)

    if (success) {
      showToast(props.transactionId ? 'Transacción actualizada' : 'Transacción guardada con éxito', 'success')
      keypadOpen.value = false
      setTimeout(() => router.push('/home'), 500)
    } else {
      showToast('Error al guardar la transacción', 'error')
    }
  } catch (error: any) {
    const msg = (error instanceof Error ? error.message : 'Ocurrió un error al guardar').replace(/^Error \d+: /, '')
    showToast(msg, 'error')
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!userStore.isAuthenticated) { router.push('/login'); return }
  if (!userStore.currentUser && userStore.userId) {
    try { await userStore.loadUserData(userStore.userId) }
    catch { router.push('/login'); return }
  }
  if (props.transactionId) loadTransactionData(props.transactionId)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

watch(() => props.transactionId, (newId) => { if (newId) loadTransactionData(newId) })
</script>

<template>
  <div class="app-shell">
    <AsideNav class="desktop-only" />
    <TopNav class="mobile-only" />

    <div class="transaction-layout">
      <TransactionFormPanel
        :transaction-id="props.transactionId"
        :type="type"
        :amount="amount"
        :categories="categories"
        :selected-category="selectedCategory"
        :concept-text="conceptText"
        :is-recurring="isRecurring"
        :frequency="frequency"
        :duration="duration"
        :end-date="endDate"
        :is-split="isSplit"
        :split-mode="splitMode"
        :account-members="accountMembers"
        :split-values="splitValues"
        :members-error="membersError"
        :active-account="activeAccount"
        :keypad-open="keypadOpen"
        @update:type="type = $event"
        @update:selected-category="selectedCategory = $event"
        @update:concept-text="conceptText = $event"
        @update:is-recurring="isRecurring = $event"
        @update:frequency="frequency = $event"
        @update:duration="duration = $event"
        @update:end-date="endDate = $event"
        @update:is-split="isSplit = $event"
        @update:split-mode="splitMode = $event"
        @update-split-value="updateSplitValue"
        @open-keypad="keypadOpen = true"
        @close-keypad="keypadOpen = false"
      />

      <KeypadPanel
        :amount="amount"
        :open="keypadOpen"
        :transaction-id="props.transactionId"
        @keypress="handleKeypad"
        @save="save"
        @close="keypadOpen = false"
        @open="keypadOpen = true"
      />
    </div>

    <BottomNav class="mobile-only" />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.app-shell {
  display: flex;
  flex-direction: column;
  // Use 100svh (small viewport) so the shell doesn't resize when virtual keyboard appears
  height: 100svh;
  min-height: 100svh;
  width: 100%;
  overflow: hidden;

  // Fallback for browsers that don't support svh
  @supports not (height: 100svh) {
    height: 100vh;
    min-height: 100vh;
  }
}

.transaction-layout {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  // On mobile, leave room at bottom for the fixed BottomNav (64px)
  padding-bottom: 64px;

  @media (min-width: 1024px) {
    flex-direction: row;
    margin-left: 240px;
    height: 100vh;
    padding-bottom: 0;
    overflow: hidden;
  }
}

.mobile-only {
  @media (min-width: 1024px) {
    display: none;
  }
}

.desktop-only {
  display: none;
  @media (min-width: 1024px) {
    display: block;
  }
}
</style>