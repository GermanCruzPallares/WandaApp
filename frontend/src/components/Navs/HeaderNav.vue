<template>
  <header class="header-nav">
    <button class="header-nav__back" @click="handleBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <h1 class="header-nav__title">{{ title }}</h1>
    
    <div class="header-nav__spacer"></div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()

const emit = defineEmits<{
  back: []
}>()

const handleBack = () => {
  emit('back')
}
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.header-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $navbar-height;
  background-color: $background-principal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px; // Horizontal only, height handles vertical
  box-sizing: border-box;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  @media (min-width: 768px) {
    left: 240px;
    width: calc(100% - 240px);
  }

  &__back {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: $color-text;
    transition: background-color $transition-speed $transition-ease;
    border-radius: 50%;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }

  &__title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: $color-text;
    margin: 0;
  }

  &__spacer {
    width: 40px;
  }
}
</style>
