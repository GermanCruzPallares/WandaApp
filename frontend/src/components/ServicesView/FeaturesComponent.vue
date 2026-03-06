<script setup lang="ts">
import { ref } from 'vue'


const currentIndex = ref(0)


const slides = [
  {
    image: 'src/images/imagenMovil.png',
    alt: 'Organización',
    title: 'Gastos claros y ordenados',
    text: 'Permite registrar y clasificar todos tus gastos diarios y fijos de forma intuitiva. Cada gasto se asigna a una categoría personalizable, para que tengas una visión clara de dónde se va tu dinero.',
    quote: '"Si cada mes pagas alquiler, transporte y compras del supermercado, WANDA te muestra automáticamente cuánto gastas en cada categoría y cómo cambia tu consumo con el tiempo."'
  },
  {
    image: 'src/images/imagenPortatil.png',
    alt: 'Balances',
    title: 'Balances al instante',
    text: 'Visualiza tus ingresos y egresos en tiempo real con gráficas fáciles de entender.',
    quote: '"Toma el control de tu futuro financiero hoy mismo."'
  },
  {
    image: 'src/images/imagenPareja.png',
    alt: 'Compartido',
    title: 'Cuentas compartidas',
    text: 'Ideal para parejas o compañeros de piso. Gestiona gastos comunes sin peleas.',
    quote: '"La transparencia hace que la convivencia sea mejor."'
  }
]


const goToSlide = (index: number) => {
  if (index >= slides.length) {
    currentIndex.value = 0
  } else if (index < 0) {
    currentIndex.value = slides.length - 1
  } else {
    currentIndex.value = index
  }
}


const nextSlide = () => {
  goToSlide(currentIndex.value + 1)
}


const prevSlide = () => {
  goToSlide(currentIndex.value - 1)
}
</script>

<template>
  <section class="features">
    <div class="features__slider">
      <div class="carousel-nav carousel-nav--left" @click="prevSlide"></div>
      <div class="carousel-nav carousel-nav--right" @click="nextSlide"></div>

      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="features__card"
        :class="{ active: currentIndex === index }"
        :data-slide="index"
      >
        <div class="features__image-col">
          <img :src="slide.image" :alt="slide.alt" class="features__img" />
        </div>
        <div class="features__text-col">
          <h2 class="features__title">{{ slide.title }}</h2>
          <p class="features__text">{{ slide.text }}</p>
          <p class="features__quote">{{ slide.quote }}</p>
        </div>
      </div>
    </div>

    <div class="features__pagination">
      <span
        v-for="(slide, index) in slides"
        :key="`dot-${index}`"
        class="features__dot"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </section>
</template>