<script setup lang="ts">
import { ref } from 'vue'

const faqs = [
  {
    question: "¿Que es Wanda?",
    answer: "Wanda es una aplicación web diseñada para facilitar la gestión y organización de información de manera eficiente."
  },
  {
    question: "¿Necesito saber contabilidad para usar WANDA?",
    answer: "No es necesario tener conocimientos previos de contabilidad. WANDA está diseñada para ser intuitiva y fácil de usar."
  },
  {
    question: "¿Cómo me ayuda WANDA a ahorrar?",
    answer: "WANDA te ayuda a ahorrar optimizando tus procesos, reduciendo tiempo de gestión y proporcionando herramientas eficientes."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí, todos tus datos están protegidos con encriptación de última generación y cumplimos con todas las normativas de seguridad."
  },
  {
    question: "¿En qué se diferencia Wanda de otras aplicaciones web?",
    answer: "Wanda se destaca por su interfaz intuitiva, su enfoque en la experiencia del usuario y sus potentes funcionalidades integradas."
  },
  
]


const activeIndex = ref<number | null>(null)


const toggleFAQ = (index: number) => {
  if (activeIndex.value === index) {
    activeIndex.value = null 
  } else {
    activeIndex.value = index 
  }
}
</script>

<template>
  <section class="faq">
    <div class="faq__container">
      <h1 class="faq__title">Preguntas frecuentes</h1>

      <div class="faq__list">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="faq__item"
          :class="{ 'faq__item--active': activeIndex === index }"
        >
          <button class="faq__question" @click="toggleFAQ(index)">
            <span class="faq__question-text">{{ faq.question }}</span>
            <span class="faq__icon">+</span>
          </button>
          
          <div class="faq__answer">
            <div class="faq__answer-content">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>