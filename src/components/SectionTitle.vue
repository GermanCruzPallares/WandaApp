<template>
  <div class="title-section">
    <h2 class="title-section__title">{{ title }}</h2>
    <button 
      v-if="showAddButton" 
      class="title-section__add-btn" 
      @click="$emit('add')"
    >
      {{ addButtonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  showAddButton?: boolean;
  addButtonText?: string;
}

withDefaults(defineProps<Props>(), {
  showAddButton: false,
  addButtonText: 'Añadir +'
});

defineEmits<{
  add: [];
}>();
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.title-section {
  position: relative;
  padding: $section-margin-horizontal;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &__title {
    font-size: $section-title-size;
    font-weight: 600;
    margin: 0;
    color: $color-text;
  }

  &__add-btn {
    background: none;
    border: none;
    color: $color-text-gray;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: color $transition-speed $transition-ease;

    &:hover {
      color: $color-text;
    }
  }
}
</style>