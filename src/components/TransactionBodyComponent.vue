<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from '@/composables/useToast'
import IconFood from './icons/IconFood.vue'
import IconTransport from './icons/IconTransport.vue'
import IconShopping from './icons/IconShopping.vue'
import IconInvoice from './icons/IconInvoice.vue'
import IconSubscription from './icons/IconSubscription.vue'
import IconArrow from './icons/IconArrow.vue'

const router = useRouter()
const transactionStore = useTransactionStore()
const userStore = useUserStore()

const type = ref<'expense' | 'income'>('expense')
const amount = ref('0')
const selectedCategory = ref<number | null>(null)
const conceptExpanded = ref(false)
const conceptText = ref('')
const isRecurring = ref(false)
const frequency = ref<'weekly' | 'monthly' | 'yearly'>('monthly')
const duration = ref<'defined' | 'indefinite'>('defined')
const endDate = ref('')
const showKeypad = ref(true)

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

const categories = [
  { id: 1, name: 'Comida', icon: IconFood },
  { id: 2, name: 'Transporte', icon: IconTransport },
  { id: 3, name: 'Compras', icon: IconShopping },
  { id: 4, name: 'Facturas', icon: IconInvoice },
  { id: 5, name: 'Subs', icon: IconSubscription },
]
const formattedAmount = computed(() => {
  return amount.value
})

const setType = (newType: 'expense' | 'income') => {
  type.value = newType
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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const { showToast } = useToast()

const save = async () => {
  if (!selectedCategory.value) {
    showToast('Por favor selecciona una categoría', 'error')
    return
  }

  if (!userStore.activeAccountId || userStore.activeAccountId <= 0) {
    showToast('No hay una cuenta activa seleccionada', 'error')
    return
  }

  if (parseFloat(amount.value.replace(',', '.')) <= 0) {
    showToast('El monto debe ser mayor a 0', 'error')
    return
  }

  const categoryName = categories.find((c) => c.id === selectedCategory.value)?.name || 'Varios'

  // Preparar datos para el backend
  const transactionData = {
    user_id: userStore.userId || 0, // Fallback if null
    category: categoryName,
    amount: parseFloat(amount.value.replace(',', '.')),
    transaction_type: type.value, // 'expense' | 'income'
    concept: conceptText.value || null,
    transaction_date: new Date().toISOString(),
    isRecurring: isRecurring.value,
    frequency: isRecurring.value ? frequency.value : null,
    end_date:
      isRecurring.value && duration.value === 'defined' && endDate.value ? endDate.value : null,
    split_type: null, // Opcional, dependiendo de la lógica de negocio
  }

  try {
    const success = await transactionStore.createTransaction(
      userStore.activeAccountId,
      transactionData,
    )

    if (success) {
      showToast('Transacción guardada con éxito', 'success')
      closeKeypad()
      // Opcional: navegar de vuelta o resetear formulario
      // router.push('/')

      // Reset form
      amount.value = '0'
      selectedCategory.value = null
      conceptText.value = ''
      isRecurring.value = false
    } else {
      showToast('Error al guardar la transacción', 'error')
    }
  } catch (error) {
    console.error('Error saving transaction:', error)
    showToast('Ocurrió un error al guardar', 'error')
  }
}
</script>

<template>
  <div class="add-movement">
    <div class="form-container">
      <div class="type-selector">
        <button :class="{ active: type === 'expense' }" @click="setType('expense')">Gasto</button>
        <button :class="{ active: type === 'income' }" @click="setType('income')">Ingreso</button>
      </div>

      <div class="amount-display" ref="amountTriggerRef" @click="openKeypad">
        <span class="currency-label">
          {{ type === 'expense' ? 'Nuevo Gasto' : 'Nuevo Ingreso' }}
        </span>
        <div class="amount-value">
          <span class="currency">EUR</span>
          <span class="value">{{ formattedAmount }}</span>
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
              <component :is="category.icon" class="category-icon" />
            </div>
            <span class="cat-name">{{ category.name }}</span>
          </button>
        </div>

        <button class="slider-arrow right" @click="scrollSlider('right')">
          <IconArrow class="arrow-icon-right" />
        </button>
      </div>

      <div class="concept-section">
        <button class="concept-toggle" @click="toggleConcept">
          <div class="toggle-content">
            <span class="toggle-text">{{
              conceptExpanded ? 'Ocultar concepto' : 'Añadir concepto (opcional)'
            }}</span>
            <IconArrow class="arrow-icon" :class="{ 'is-expanded': conceptExpanded }" />
          </div>
        </button>
        <div v-if="conceptExpanded" class="concept-input-wrapper">
          <input
            type="text"
            v-model="conceptText"
            placeholder="Ej: Mercadona"
            class="concept-input"
          />
        </div>
      </div>

      <div class="recurring-section">
        <div class="recurring-header">
          <span>Gasto Frecuente</span>
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
            <button :class="{ active: frequency === 'yearly' }" @click="frequency = 'yearly'">
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
        <button class="save-btn" @click="save">Guardar</button>
      </div>
    </Teleport>
  </div>
</template>
