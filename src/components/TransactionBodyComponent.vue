<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconFood from './icons/IconFood.vue'
import IconTransport from './icons/IconTransport.vue'
import IconShopping from './icons/IconShopping.vue'
import IconInvoice from './icons/IconInvoice.vue'
import IconSubscription from './icons/IconSubscription.vue'
import IconArrow from './icons/IconArrow.vue'

const type = ref('expense')
const amount = ref('0')
const selectedCategory = ref(null)
const conceptExpanded = ref(false)
const conceptText = ref('')
const isRecurring = ref(false)
const frequency = ref('monthly')
const duration = ref('defined')
const endDate = ref()
const showKeypad = ref(true)

const keypadRef = ref(null)
const amountTriggerRef = ref(null)

const touchStartY = ref(0)
const touchEndY = ref(0)

const onTouchStart = (e) => {
  touchStartY.value = e.changedTouches[0].screenY
}

const onTouchMove = (e) => {
  touchEndY.value = e.changedTouches[0].screenY
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

const setType = (newType) => {
  type.value = newType
}

const toggleConcept = () => {
  conceptExpanded.value = !conceptExpanded.value
}

const handleKeypad = (key) => {
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

const save = () => {
  console.log({
    type: type.value,
    amount: amount.value,
    category: selectedCategory.value,
    concept: conceptText.value,
    recurring: isRecurring.value ? { frequency: frequency.value, duration: duration.value } : null,
  })
  closeKeypad()
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

      <div class="categories-slider">
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
  </div>
</template>
