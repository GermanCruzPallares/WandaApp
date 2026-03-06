<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  amount: string
  open: boolean
  transactionId?: number
  hasSidebar?: boolean
}>()

const emit = defineEmits<{
  keypress: [key: number | string]
  save: []
  close: []
  open: []
}>()

// ─── Touch swipe for mobile bottom sheet ─────────────────────────────────────
const touchStartY = ref(0)
const touchEndY = ref(0)

const onTouchStart = (e: TouchEvent) => {
  if (e.changedTouches[0]) touchStartY.value = e.changedTouches[0].screenY
}
const onTouchMove = (e: TouchEvent) => {
  if (e.changedTouches[0]) touchEndY.value = e.changedTouches[0].screenY
}
const onTouchEnd = () => {
  if (touchStartY.value - touchEndY.value > 50) emit('open')
  else if (touchEndY.value - touchStartY.value > 50) emit('close')
}

const saveLabel = props.transactionId ? 'Guardar cambios' : 'Guardar'
</script>

<template>
  <div
    class="keypad-panel"
    :class="{ 'is-open': open, 'has-sidebar': hasSidebar }"
  >
    <!-- Mobile handle -->
    <div
      class="handle-area"
      @click="open ? emit('close') : emit('open')"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="handle-bar"></div>
    </div>

    <!-- Numeric grid -->
    <div class="numeric-grid">
      <button @click="emit('keypress', 1)">1</button>
      <button @click="emit('keypress', 2)">2</button>
      <button @click="emit('keypress', 3)">3</button>
      <button @click="emit('keypress', 4)">4</button>
      <button @click="emit('keypress', 5)">5</button>
      <button @click="emit('keypress', 6)">6</button>
      <button @click="emit('keypress', 7)">7</button>
      <button @click="emit('keypress', 8)">8</button>
      <button @click="emit('keypress', 9)">9</button>
      <button @click="emit('keypress', ',')">,</button>
      <button @click="emit('keypress', 0)">0</button>
      <button @click="emit('keypress', 'backspace')" class="backspace">←</button>
    </div>

    <!-- Save button -->
    <button class="save-btn" @click="emit('save')">
      {{ transactionId ? 'Guardar cambios' : 'Guardar' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
// ─── Base (mobile: fixed bottom sheet) ───────────────────────────────────────
.keypad-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #a0a0a5;
  z-index: 1200;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.18);
  max-height: 48vh;
  padding: 0 20px calc(80px + env(safe-area-inset-bottom)) 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateY(100%);

  &.is-open {
    transform: translateY(0);
  }

  &.has-sidebar {
    // On tablet the sidebar is visible (240px), offset keypad so it doesn't cover it
    @media (max-width: 1023px) {
      left: 240px;
    }
  }

  // ─── Desktop: right column, always visible ────────────────────────────────
  @media (min-width: 768px) {
    position: relative;
    width: 420px;
    min-width: 420px;
    max-height: none;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
    padding: 0 40px;
    transform: none !important;
    justify-content: center;
    align-items: center;
    gap: 18px;
    flex-shrink: 0;
    overflow: hidden;
  }
}

// ─── Handle (mobile only) ─────────────────────────────────────────────────────
.handle-area {
  width: 100%;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  touch-action: none;
  flex-shrink: 0;

  @media (min-width: 768px) { display: none; }
}

.handle-bar {
  width: 80px;
  height: 5px;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 3px;
}

// ─── Numeric grid ─────────────────────────────────────────────────────────────
.numeric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
  max-width: 180px;
  margin-bottom: 10px;

  button {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #5c5c64;
    border: none;
    font-size: 1.1rem;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
    transition: background 0.15s;

    &:active { background: #8e8e8e; }
  }

  @media (min-width: 768px) {
    gap: 14px;
    max-width: 220px;
    margin-bottom: 20px;

    button {
      background: rgba(0, 0, 0, 0.22);
      font-size: 1.5rem;
      &:active { background: rgba(0, 0, 0, 0.42); }
    }
  }
}

// ─── Save button ──────────────────────────────────────────────────────────────
.save-btn {
  // Mobile: hidden — save button is in the form panel instead
  display: none;

  @media (min-width: 768px) {
    display: block;
    background: #3c3c3c;
    color: #fff;
    border: none;
    height: 52px;
    width: 100%;
    max-width: 240px;
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    flex-shrink: 0;
    transition: transform 0.15s;

    &:active { transform: scale(0.97); }
  }
}
</style>