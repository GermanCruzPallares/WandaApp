<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="info-modal-overlay" @click="handleClose">
        <Transition name="modal-slide">
          <div v-if="isOpen" class="info-modal" @click.stop>

            <button class="info-modal__close" @click="handleClose">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <h2 class="info-modal__title">{{ title }}</h2>
            <p class="info-modal__content">{{ content }}</p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

interface Props {
  isOpen: boolean;
  title: string;
  content: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit('close');
};


watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.info-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.info-modal {
  background-color: $color-white;
  border-radius: $card-border-radius;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: $color-text;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color $transition-speed $transition-ease;

    &:hover {
      color: $color-text--dk;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 16px 0;
    padding-right: 32px; 
  }

  &__content {
    font-size: 15px;
    line-height: 1.6;
    color: $color-text-gray;
    margin: 0;
  }
}

// Animaciones
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease;
}

.modal-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.6, 1),
              opacity 0.25s ease;
}

.modal-slide-enter-from {
  transform: scale(0.9);
  opacity: 0;
}

.modal-slide-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.modal-slide-enter-to {
  transform: scale(1);
  opacity: 1;
}
</style>