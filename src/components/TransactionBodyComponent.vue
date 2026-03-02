<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from '@/composables/useToast'
import { getCategoryIcon } from './icons/CategoryIcons'
import IconArrow from './icons/IconArrow.vue'
import type { FrequencyType, SplitType } from '@/types/models'

const props = defineProps<{
  transactionId?: number
}>()

const router = useRouter()
const transactionStore = useTransactionStore()
const userStore = useUserStore()

// Replicando la lógica de HomeView para garantizar la cuenta activa correcta
const accounts = computed(() => {
  return userStore.accounts.map((account) => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId,
  }))
})

const activeAccount = computed(() => {
  return accounts.value.find((acc) => acc.isActive)
})

const type = ref<'expense' | 'income'>('expense')
const amount = ref('0')
const selectedCategory = ref<number | null>(null)
const conceptExpanded = ref(false)
const conceptText = ref('')
const isRecurring = ref(false)
const frequency = ref<'weekly' | 'monthly' | 'annual'>('monthly')
const duration = ref<'defined' | 'indefinite'>('defined')
const endDate = ref('')
const showKeypad = ref(false)

const keypadRef = ref<HTMLElement | null>(null)
const amountTriggerRef = ref<HTMLElement | null>(null)

const touchStartY = ref(0)
const touchEndY = ref(0)

const onTouchStart = (e: TouchEvent) => {
  if (e.changedTouches.length > 0) {
    touchStartY.value = e.changedTouches[0]!.screenY
  }
}

const onTouchMove = (e: TouchEvent) => {
  if (e.changedTouches.length > 0) {
    touchEndY.value = e.changedTouches[0]!.screenY
  }
}

const onTouchEnd = () => {
  if (touchStartY.value - touchEndY.value > 50) {
    showKeypad.value = true
  } else if (touchEndY.value - touchStartY.value > 50) {
    showKeypad.value = false
  }
}

const openKeypad = () => {
  showKeypad.value = true
}

const closeKeypad = () => {
  showKeypad.value = false
}

const sliderRef = ref<HTMLElement | null>(null)

const scrollSlider = (direction: 'left' | 'right') => {
  if (sliderRef.value) {
    const scrollAmount = 200
    sliderRef.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }
}

const expenseCategories = [
  { id: 1, name: 'Alimentación' },
  { id: 2, name: 'Transporte' },
  { id: 3, name: 'Compras' },
  { id: 4, name: 'Facturas' },
  { id: 5, name: 'Suscripciones' },
  { id: 6, name: 'Ocio' },
  { id: 7, name: 'Salud' },
  { id: 8, name: 'Hogar' },
  { id: 9, name: 'Otros' },
]

const incomeCategories = [
  { id: 10, name: 'Salario' },
  { id: 11, name: 'Freelance' },
  { id: 12, name: 'Inversión' },
  { id: 13, name: 'Venta' },
]

const categories = computed(() => {
  return type.value === 'expense' ? expenseCategories : incomeCategories
})

const formattedAmount = computed(() => {
  return amount.value
})

const setType = (newType: 'expense' | 'income') => {
  if (type.value !== newType) {
    type.value = newType
    selectedCategory.value = null
  }
}

const toggleConcept = () => {
  conceptExpanded.value = !conceptExpanded.value
}

const handleKeypad = (key: number | string) => {
  if (key === 'backspace') {
    if (amount.value.length > 1) {
      amount.value = amount.value.slice(0, -1)
    } else {
      amount.value = '0'
    }
    return
  }

  if (amount.value === '0' && key !== ',') {
    amount.value = key.toString()
  } else {
    if (key === ',' && amount.value.includes(',')) return
    amount.value += key.toString()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (
    (e.target as HTMLElement).tagName === 'INPUT' ||
    (e.target as HTMLElement).tagName === 'TEXTAREA'
  )
    return

  if (!isNaN(Number(e.key)) && e.key !== ' ') {
    handleKeypad(parseInt(e.key))
  } else if (e.key === 'Backspace') {
    handleKeypad('backspace')
  } else if (e.key === ',' || e.key === '.') {
    handleKeypad(',')
  } else if (e.key === 'Enter') {
    save()
  }
}

onMounted(async () => {
  // Verificar autenticación y asegurar datos igual que HomeView
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Si el store no tiene datos cargados, cargarlos
  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId)
    } catch (error) {
      console.error('❌ Error cargando datos en TransactionBody:', error)
      router.push('/login')
    }
  }

  // Cargar datos si estamos en modo Edición
  if (props.transactionId) {
    loadTransactionData(props.transactionId)
  }

  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousedown', handleClickOutside)
})

const handleClickOutside = (e: MouseEvent) => {
  if (!showKeypad.value) return

  const keypad = document.querySelector('.keypad-overlay')
  const amountTrigger = amountTriggerRef.value

  if (
    keypad &&
    !keypad.contains(e.target as Node) &&
    amountTrigger &&
    !amountTrigger.contains(e.target as Node)
  ) {
    showKeypad.value = false
  }
}

const scrollToSelected = () => {
  const slider = sliderRef.value
  if (!slider) return

  setTimeout(() => {
    const selectedEl = slider.querySelector('.category-item.selected') as HTMLElement
    if (selectedEl) {
      const containerWidth = slider.offsetWidth
      const itemOffset = selectedEl.offsetLeft
      const itemWidth = selectedEl.offsetWidth
      // Center the selected category
      slider.scrollTo({
        left: itemOffset - containerWidth / 2 + itemWidth / 2,
        behavior: 'smooth',
      })
    }
  }, 100)
}

watch(
  () => props.transactionId,
  (newId) => {
    if (newId) {
      loadTransactionData(newId)
    }
  },
)

const loadTransactionData = async (id: number) => {
  try {
    const trx = await transactionStore.fetchTransactionById(id)
    if (trx) {
      // ✅ Security Check: Only allow access if the transaction belongs to the current user
      if (trx.user_id !== userStore.userId) {
        console.error('❌ Unauthorized access attempt to transaction:', id)
        showToast('No tienes permiso para acceder a esta transacción', 'error')
        router.push('/home')
        return
      }

      type.value = trx.transaction_type === 'income' ? 'income' : 'expense'
      // Formatear monto: cambiar punto por coma si tiene decimales, y convertir a string
      amount.value = trx.amount.toString().replace('.', ',')

      console.log('--- CATEGORY MATCHING DEBUG ---')
      console.log('Incoming category from DB:', trx.category)
      const foundCat = categories.value.find((c) => {
        if (!c.name || !trx.category) return false
        return c.name.localeCompare(trx.category, undefined, { sensitivity: 'base' }) === 0
      })
      console.log('Found local category:', foundCat)
      selectedCategory.value = foundCat ? foundCat.id : null

      conceptText.value = trx.concept && trx.concept !== trx.category ? trx.concept : ''
      conceptExpanded.value = true // Always expand when editing so they can see it

      isRecurring.value = !!trx.isRecurring
      if (trx.frequency) {
        frequency.value = trx.frequency as 'weekly' | 'monthly' | 'annual'
      }

      if (trx.end_date) {
        duration.value = 'defined'
        // Extraer YYYY-MM-DD
        endDate.value =
          typeof trx.end_date === 'string'
            ? trx.end_date.split('T')[0] || ''
            : new Date(trx.end_date).toISOString().split('T')[0] || ''
      } else {
        duration.value = 'indefinite'
      }

      // Auto-scroll only triggered when loading existing data
      await nextTick()
      scrollToSelected()
    }
  } catch (error) {
    console.error('Error cargando transacción a editar:', error)
    showToast('No se pudo cargar la transacción', 'error')
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousedown', handleClickOutside)
})

const { showToast } = useToast()

const save = async () => {
  if (!selectedCategory.value) {
    showToast('Por favor selecciona una categoría', 'error')
    return
  }

  // Verificar la cuenta activa usando la misma lógica robusta que HomeView
  if (!activeAccount.value || !activeAccount.value.account_id) {
    showToast('No hay una cuenta activa seleccionada', 'error')
    return
  }

  if (parseFloat(amount.value.replace(',', '.')) <= 0) {
    showToast('El monto debe ser mayor a 0', 'error')
    return
  }

  const categoryName =
    categories.value.find((c) => c.id === selectedCategory.value)?.name || 'Varios'

  // Preparar datos para el backend, coincidiendo exactamente con TransactionCreateDTO
  const transactionData = {
    objective_id: 0, // Requerido por el DTO (int no nulo)
    category: categoryName,
    amount: parseFloat(amount.value.replace(',', '.')),
    transaction_type: type.value, // 'expense' | 'income'
    concept: conceptText.value || categoryName, // string no nulo en C#
    transaction_date: new Date().toISOString(),
    isRecurring: isRecurring.value,
    frequency: isRecurring.value ? frequency.value : null, // string? en C#
    end_date:
      isRecurring.value && duration.value === 'defined' && endDate.value ? endDate.value : null, // DateTime? en C#
    split_type: 'individual' as const,
    customSplits: null,
  }

  try {
    let success = false

    if (props.transactionId) {
      // Modo Edición
      success = await transactionStore.updateTransaction(props.transactionId, transactionData)
    } else {
      // Modo Creación
      success = await transactionStore.createTransaction(
        activeAccount.value.account_id,
        transactionData,
      )
    }

    if (success) {
      showToast(
        props.transactionId ? 'Transacción actualizada' : 'Transacción guardada con éxito',
        'success',
      )
      closeKeypad()

      if (props.transactionId) {
        setTimeout(() => {
          router.push('/home')
        }, 500)
      } else {
        // Reset form
        amount.value = '0'
        selectedCategory.value = null
        conceptText.value = ''
        isRecurring.value = false
      }
    } else {
      showToast('Error al guardar la transacción', 'error')
    }
  } catch (error: any) {
    console.error('Error saving transaction:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al guardar'
    const cleanMessage = errorMessage.replace(/^Error \d+: /, '')
    showToast(cleanMessage, 'error')
  }
}
</script>

<template>
  <div class="add-movement" :class="{ 'spacer-active': showKeypad }">
    <div class="form-container">
      <slot name="desktop-header"></slot>
      <div
        v-if="!props.transactionId"
        class="type-selector"
        :class="{ 'is-add-view': !props.transactionId }"
      >
        <button :class="{ active: type === 'expense' }" @click="setType('expense')">Gasto</button>
        <button :class="{ active: type === 'income' }" @click="setType('income')">Ingreso</button>
      </div>

      <div class="amount-display" ref="amountTriggerRef" @click="openKeypad">
        <span class="currency-label">
          {{
            props.transactionId
              ? type === 'expense'
                ? 'Editar Gasto'
                : 'Editar Ingreso'
              : type === 'expense'
                ? 'Nuevo Gasto'
                : 'Nuevo Ingreso'
          }}
        </span>
        <div class="amount-value" :class="{ 'is-active': showKeypad }">
          <span class="currency">EUR</span>
          <span class="value"
            >{{ formattedAmount }}<span class="cursor" v-if="showKeypad">|</span></span
          >
        </div>
      </div>

      <div class="slider-container">
        <button class="slider-arrow left" @click="scrollSlider('left')">
          <IconArrow class="arrow-icon-left" />
        </button>

        <div class="categories-slider" ref="sliderRef">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ selected: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            <div class="icon-circle">
              <component :is="getCategoryIcon(category.name)" class="category-icon" />
            </div>
            <span class="cat-name">{{ category.name }}</span>
          </button>
        </div>

        <button class="slider-arrow right" @click="scrollSlider('right')">
          <IconArrow class="arrow-icon-right" />
        </button>
      </div>

      <div class="concept-section">
        <div class="concept-input-wrapper">
          <input
            type="text"
            v-model="conceptText"
            placeholder="Añadir concepto (Ej: Mercadona, Nómina...)"
            class="concept-input"
            @focus="showKeypad = false"
          />
        </div>
      </div>

      <div class="recurring-section" :class="{ 'is-active': isRecurring }">
        <div class="recurring-header">
          <span>{{ type === 'expense' ? 'Gasto Frecuente' : 'Ingreso Frecuente' }}</span>
          <label class="switch">
            <input type="checkbox" v-model="isRecurring" />
            <span class="slider round"></span>
          </label>
        </div>

        <div v-if="isRecurring" class="recurring-options">
          <div class="segment-control">
            <button :class="{ active: frequency === 'weekly' }" @click="frequency = 'weekly'">
              Semanal
            </button>
            <button :class="{ active: frequency === 'monthly' }" @click="frequency = 'monthly'">
              Mensual
            </button>
            <button :class="{ active: frequency === 'annual' }" @click="frequency = 'annual'">
              Anual
            </button>
          </div>

          <p class="helper-text">
            * Desde hoy se procesará esta transacción
            {{
              frequency === 'weekly'
                ? 'semanalmente'
                : frequency === 'monthly'
                  ? 'mensualmente'
                  : 'anualmente'
            }}
          </p>

          <div class="duration-control">
            <button :class="{ active: duration === 'indefinite' }" @click="duration = 'indefinite'">
              Indefinido
            </button>
            <button :class="{ active: duration === 'defined' }" @click="duration = 'defined'">
              Definido
            </button>
          </div>

          <div v-if="duration === 'defined'" class="date-picker">
            <span>Fecha de fin:</span>
            <input type="date" v-model="endDate" class="date-input" />
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div class="keypad-overlay" :class="{ 'is-visible': showKeypad }" ref="keypadRef">
        <div
          class="handle-area"
          @click="showKeypad = !showKeypad"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div class="handle-bar"></div>
        </div>
        <div class="numeric-grid">
          <button @click="handleKeypad(1)">1</button>
          <button @click="handleKeypad(2)">2</button>
          <button @click="handleKeypad(3)">3</button>
          <button @click="handleKeypad(4)">4</button>
          <button @click="handleKeypad(5)">5</button>
          <button @click="handleKeypad(6)">6</button>
          <button @click="handleKeypad(7)">7</button>
          <button @click="handleKeypad(8)">8</button>
          <button @click="handleKeypad(9)">9</button>
          <button @click="handleKeypad(',')">,</button>
          <button @click="handleKeypad(0)">0</button>
          <button @click="handleKeypad('backspace')" class="backspace">←</button>
        </div>
        <button class="save-btn" @click="save">
          {{ props.transactionId ? 'Guardar cambios' : 'Guardar' }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
