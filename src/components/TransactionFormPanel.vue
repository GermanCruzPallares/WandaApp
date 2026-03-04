<script setup lang="ts">
import { ref } from 'vue'
import { getCategoryIcon } from './icons/CategoryIcons'
import IconArrow from './icons/IconArrow.vue'
import type { User } from '@/types/models'

// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps<{
  transactionId?: number
  type: 'expense' | 'income' | 'saving'
  amount: string
  categories: { id: number; name: string }[]
  selectedCategory: number | null
  conceptText: string
  isRecurring: boolean
  frequency: 'weekly' | 'monthly' | 'annual'
  duration: 'defined' | 'indefinite'
  endDate: string
  isSplit: boolean
  splitMode: 'percentage' | '50-50' | 'amount'
  accountMembers: User[]
  splitValues: Record<number, { percentage: number; amount: number }>
  membersError: string
  activeAccount: { account_id: number; account_type: string } | undefined
  keypadOpen: boolean
}>()

// ─── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  'update:type': ['expense' | 'income' | 'saving']
  'update:selectedCategory': [number | null]
  'update:conceptText': [string]
  'update:isRecurring': [boolean]
  'update:frequency': ['weekly' | 'monthly' | 'annual']
  'update:duration': ['defined' | 'indefinite']
  'update:endDate': [string]
  'update:isSplit': [boolean]
  'update:splitMode': ['percentage' | '50-50' | 'amount']
  'updateSplitValue': [userId: number, field: 'percentage' | 'amount', val: number]
  'openKeypad': []
  'closeKeypad': []
}>()

// ─── Category slider ──────────────────────────────────────────────────────────
const sliderRef = ref<HTMLElement | null>(null)
const scrollSlider = (dir: 'left' | 'right') => {
  sliderRef.value?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
}

// ─── Computed label helpers ───────────────────────────────────────────────────
const titleLabel = (t: string) => {
  if (props.transactionId) {
    return t === 'expense' ? 'Editar Gasto' : t === 'income' ? 'Editar Ingreso' : 'Editar Ahorro'
  }
  return t === 'expense' ? 'Nuevo Gasto' : 'Nuevo Ingreso'
}

const recurringLabel = (t: string) =>
  t === 'expense' ? 'Gasto Frecuente' : t === 'income' ? 'Ingreso Frecuente' : 'Ahorro Frecuente'

const frequencyLabel = (f: string) =>
  f === 'weekly' ? 'semanalmente' : f === 'monthly' ? 'mensualmente' : 'anualmente'
</script>

<template>
  <div class="form-panel" :class="{ 'keypad-open': keypadOpen }">
    <div class="form-inner">

      <!-- Type selector -->
      <div
        v-if="!transactionId && activeAccount?.account_type !== 'joint'"
        class="type-selector"
        :class="{ 'is-add-view': !transactionId }"
      >
        <button :class="{ active: type === 'expense' }" @click="emit('update:type', 'expense')">Gasto</button>
        <button :class="{ active: type === 'income' }" @click="emit('update:type', 'income')">Ingreso</button>
      </div>

      <!-- Amount display -->
      <div class="amount-display" @click="emit('openKeypad')">
        <span class="amount-title">{{ titleLabel(type) }}</span>
        <div class="amount-value" :class="{ 'is-active': keypadOpen }">
          <span class="currency">EUR</span>
          <span class="value">
            {{ amount }}<span class="cursor" v-if="keypadOpen">|</span>
          </span>
        </div>
      </div>

      <!-- Categories slider -->
      <div class="slider-container">
        <button class="slider-arrow left" @click="scrollSlider('left')">
          <IconArrow class="arrow-icon-left" />
        </button>
        <div class="categories-slider" ref="sliderRef">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            :class="{ selected: selectedCategory === cat.id }"
            @click="emit('update:selectedCategory', cat.id)"
          >
            <div class="icon-circle">
              <component :is="getCategoryIcon(cat.name)" class="category-icon" />
            </div>
            <span class="cat-name">{{ cat.name }}</span>
          </button>
        </div>
        <button class="slider-arrow right" @click="scrollSlider('right')">
          <IconArrow class="arrow-icon-right" />
        </button>
      </div>

      <!-- Concept input -->
      <div class="concept-section">
        <div class="concept-input-wrapper">
          <input
            type="text"
            :value="conceptText"
            placeholder="Añadir concepto (opcional)"
            class="concept-input"
            @input="emit('update:conceptText', ($event.target as HTMLInputElement).value)"
            @focus="emit('closeKeypad')"
          />
        </div>
      </div>

      <!-- Recurring toggle -->
      <div class="section-card" :class="{ 'is-active': isRecurring }">
        <div class="section-header">
          <span>{{ recurringLabel(type) }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="isRecurring"
              @change="emit('update:isRecurring', ($event.target as HTMLInputElement).checked)"
            />
            <span class="slider round"></span>
          </label>
        </div>

        <div v-if="isRecurring" class="section-body">
          <div class="segment-control">
            <button :class="{ active: frequency === 'weekly' }" @click="emit('update:frequency', 'weekly')">Semanal</button>
            <button :class="{ active: frequency === 'monthly' }" @click="emit('update:frequency', 'monthly')">Mensual</button>
            <button :class="{ active: frequency === 'annual' }" @click="emit('update:frequency', 'annual')">Anual</button>
          </div>
          <p class="helper-text">* Desde hoy se procesará esta transacción {{ frequencyLabel(frequency) }}</p>
          <div class="duration-control">
            <button :class="{ active: duration === 'indefinite' }" @click="emit('update:duration', 'indefinite')">Indefinido</button>
            <button :class="{ active: duration === 'defined' }" @click="emit('update:duration', 'defined')">Definido</button>
          </div>
          <div v-if="duration === 'defined'" class="date-picker">
            <span>Fecha de fin:</span>
            <input
              type="date"
              :value="endDate"
              class="date-input"
              @change="emit('update:endDate', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <!-- Split section (joint accounts only) -->
      <div
        v-if="activeAccount?.account_type === 'joint'"
        class="section-card split-section"
        :class="{ 'is-active': isSplit }"
      >
        <div class="section-header">
          <div class="split-header-text">
            <span>Gasto Dividido</span>
            <small class="edit-warning" v-if="transactionId && isSplit">
              Solo puede eliminarse desde el historial
            </small>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="isSplit"
              :disabled="transactionId !== undefined"
              @change="emit('update:isSplit', ($event.target as HTMLInputElement).checked)"
            />
            <span class="slider round"></span>
          </label>
        </div>

        <div v-if="isSplit && !transactionId" class="section-body split-options">
          <div class="segment-control">
            <button :class="{ active: splitMode === 'percentage' }" @click="emit('update:splitMode', 'percentage')">%</button>
            <button :class="{ active: splitMode === '50-50' }" @click="emit('update:splitMode', '50-50')">50/50</button>
            <button :class="{ active: splitMode === 'amount' }" @click="emit('update:splitMode', 'amount')">Importe</button>
          </div>
          <p class="helper-text info-text">
            * Cuando el resto de integrantes acepten la transacción, el gasto compartido se verá reflejado en la cuenta conjunta.
          </p>
          <div class="split-members-list">
            <div v-for="(member, index) in accountMembers" :key="member.user_id" class="split-member-item">
              <div class="member-top-row">
                <div class="member-info">
                  <div
                    class="member-avatar"
                    :style="{ background: index % 2 === 0 ? '#a9f06b' : '#333', color: index % 2 === 0 ? '#000' : '#fff' }"
                  >
                    {{ member.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="member-name">{{ member.name }}</span>
                </div>
                <span class="member-calculated" v-if="splitMode !== 'amount'">
                  {{ splitValues[member.user_id]?.amount.toFixed(2).replace('.', ',') }}€
                </span>
                <div v-else class="member-input-control">
                  <input
                    type="number" step="0.01" class="amount-input"
                    :value="splitValues[member.user_id]?.amount || 0"
                    @change="emit('updateSplitValue', member.user_id, 'amount', parseFloat(($event.target as HTMLInputElement).value))"
                  />
                  <span>€</span>
                </div>
              </div>
              <div v-if="splitMode === 'percentage'" class="member-range-row">
                <input
                  type="range" class="range-slider" min="0" max="100"
                  :value="splitValues[member.user_id]?.percentage || 0"
                  @input="emit('updateSplitValue', member.user_id, 'percentage', parseFloat(($event.target as HTMLInputElement).value))"
                />
                <div class="range-labels">
                  <span>{{ splitValues[member.user_id]?.percentage.toFixed(0) }}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div class="member-divider" v-if="index < accountMembers.length - 1"></div>
            </div>
            <p v-if="membersError" class="helper-text error-text">{{ membersError }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
// ─── Panel base ───────────────────────────────────────────────────────────────
.form-panel {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;

  // Mobile: TopNav height (64px) + safe area inset + extra breathing room
  padding-top: calc(64px + env(safe-area-inset-top) + 12px);
  padding-bottom: 60px; // just enough for the keypad peek handle

  &.keypad-open {
    padding-bottom: 280px; // room when keypad fully open
  }

  @media (min-width: 1024px) {
    background: #ececec;
    padding-top: 0;
    padding-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; // vertically center the form-inner
    overflow-y: auto;
  }
}

.form-inner {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 24px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (min-width: 1024px) {
    max-width: 520px;
    gap: 22px;
    padding: 0 32px;
    width: 100%;
  }
}

// ─── Type selector ────────────────────────────────────────────────────────────
.type-selector {
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 12px;

  button {
    background: #e0e0e0;
    border: none;
    padding: 10px 36px;
    border-radius: 24px;
    color: #8e8e93;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;

    &.active {
      background: #333;
      color: #fff;
    }

    @media (min-width: 1024px) {
      padding: 12px 52px;
      font-size: 1rem;
      background: rgba(0, 0, 0, 0.13);
      color: #555;

      &.active {
        background: #333;
        color: #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

// ─── Amount display ───────────────────────────────────────────────────────────
.amount-display {
  width: 100%;
  text-align: center;
  cursor: pointer;
  padding: 8px 0;

  .amount-title {
    display: block;
    font-size: 1.1rem;
    color: #888;
    margin-bottom: 4px;

    @media (min-width: 1024px) {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 12px;
    }
  }

  .amount-value {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s ease;

    &.is-active {
      transform: scale(1.04);
      .value { color: #a698c4; }
    }

    .currency {
      font-size: 1rem;
      color: #555;
      margin-bottom: 2px;
    }

    .value {
      font-size: 3.5rem;
      font-weight: 400;
      color: #000;
      line-height: 1;
      display: flex;
      align-items: center;
      transition: color 0.2s ease;

      .cursor {
        font-weight: 300;
        color: #a698c4;
        animation: blink 1s step-end infinite;
        margin-left: 2px;
      }
    }
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

// ─── Category slider ──────────────────────────────────────────────────────────
.slider-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slider-arrow {
  display: flex; // visible on both mobile and desktop
  background: none;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.2s, transform 0.2s;
  flex-shrink: 0;
  padding: 0;

  &:hover { opacity: 1; transform: scale(1.1); }
  &:active { opacity: 1; transform: scale(0.95); }

  svg { width: 16px; height: 16px; }
  .arrow-icon-left { transform: rotate(90deg); }
  .arrow-icon-right { transform: rotate(-90deg); }

  @media (min-width: 1024px) {
    width: 36px;
    height: 36px;
    svg { width: 18px; height: 18px; }
  }
}

.categories-slider {
  display: flex;
  overflow-x: auto;
  flex: 1; // take remaining space between the two arrows
  min-width: 0; // allow shrinking
  padding: 6px 4px;
  gap: 12px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scroll-behavior: smooth;

  &::-webkit-scrollbar { display: none; }

  @media (min-width: 1024px) {
    justify-content: center;
    gap: 20px;
  }
}

.category-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  min-width: 58px;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s;

  &.selected {
    opacity: 1;
    .icon-circle {
      background-color: #a698c4;
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px #a698c4;
      color: #fff;
    }
    .cat-name { font-weight: 600; }
  }

  .icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #f2f2f7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #444;
    transition: all 0.25s ease;
    border: 1px solid rgba(0,0,0,0.05);

    .category-icon { width: 24px; height: 24px; }

    @media (min-width: 1024px) {
      width: 55px;
      height: 55px;
      background: rgba(255,255,255,0.35);
      .category-icon { width: 28px; height: 28px; }
    }
  }

  .cat-name {
    font-size: 0.72rem;
    color: #333;
  }
}

// ─── Concept input ────────────────────────────────────────────────────────────
.concept-section {
  .concept-input-wrapper {
    background: #fff;
    padding: 4px 16px;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .concept-input {
    width: 100%;
    border: none;
    padding: 12px 0;
    outline: none;
    font-size: 0.95rem;
    color: #333;
    background: transparent;

    &::placeholder { color: #aaa; }
  }
}

// ─── Section cards (recurring / split) ───────────────────────────────────────
.section-card {
  background: #f7f7f7;
  border-radius: 18px;
  padding: 16px 18px;
  transition: all 0.3s ease;

  &.is-active {
    background: #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }

  @media (min-width: 1024px) {
    background: rgba(255,255,255,0.4);
    &.is-active { background: rgba(255,255,255,0.6); }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.section-body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  flex-shrink: 0;

  input { opacity: 0; width: 0; height: 0; }

  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: #ccc;
    transition: 0.35s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      transition: 0.35s;
      border-radius: 50%;
    }
  }

  input:checked + .slider { background: #4cd964; }
  input:checked + .slider:before { transform: translateX(22px); }
}

// ─── Segment controls ─────────────────────────────────────────────────────────
.segment-control {
  background: #f2f2f7;
  padding: 4px;
  border-radius: 12px;
  display: flex;
  gap: 4px;

  button {
    flex: 1;
    border: none;
    background: transparent;
    padding: 8px 0;
    border-radius: 10px;
    font-size: 0.83rem;
    color: #666;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &.active {
      background: #555;
      color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    }
  }
}

.duration-control {
  background: #eee;
  border-radius: 10px;
  display: flex;
  gap: 2px;
  padding: 2px;

  button {
    flex: 1;
    border: none;
    background: transparent;
    padding: 8px;
    font-size: 0.82rem;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;

    &.active {
      color: #333;
      font-weight: 600;
      &::before { content: '• '; color: #4cd964; }
    }
  }
}

.helper-text {
  font-size: 0.73rem;
  color: #999;
  margin: 0;

  &.info-text {
    background: rgba(166,152,196,0.07);
    padding: 10px 12px;
    border-radius: 8px;
    border-left: 3px solid #a698c4;
    font-style: italic;
  }

  &.error-text { color: #e74c3c; margin-top: 8px; }
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 8px;

  .date-input {
    border: none;
    background: transparent;
    font-family: inherit;
    color: #666;
    outline: none;
  }
}

// ─── Split members ────────────────────────────────────────────────────────────
.split-section {
  .split-header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .edit-warning {
    font-size: 0.68rem;
    color: #e74c3c;
    font-weight: 500;
    max-width: 200px;
    line-height: 1.2;
  }
}

.split-members-list { display: flex; flex-direction: column; gap: 12px; }

.split-member-item { display: flex; flex-direction: column; gap: 10px; }

.member-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info { display: flex; align-items: center; gap: 10px; }

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.member-name, .member-calculated { font-size: 0.92rem; font-weight: 500; color: #333; }

.member-input-control {
  display: flex;
  align-items: center;
  gap: 4px;

  .amount-input {
    width: 68px;
    padding: 5px;
    border: none;
    background: #f0f0f5;
    border-radius: 6px;
    text-align: right;
    font-weight: 600;
    font-family: inherit;
    outline: none;
    &:focus { box-shadow: 0 0 0 2px #333; }
  }
}

.member-range-row {
  display: flex;
  flex-direction: column;
  width: 100%;

  .range-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #777;
      border: 2px solid #fff;
      box-shadow: 0 0 4px rgba(0,0,0,0.2);
      cursor: pointer;
    }
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    font-weight: 700;
    margin-top: 6px;
    padding: 0 2px;
  }
}

.member-divider { height: 1px; background: #eee; }
</style>