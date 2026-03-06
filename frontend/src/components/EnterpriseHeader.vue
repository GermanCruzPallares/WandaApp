<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
const NavBtnStatus = ref(false)
const route = useRoute();
function changeStatus() {
  NavBtnStatus.value = !NavBtnStatus.value
}
const isDarkHeader = computed(() => {
  const darkPages = ['contact', 'otra-pagina-futura'] 
  return darkPages.includes(route.name as string)
})
</script>

<template>
  <header class="main-header" :class="{ 'main-header--dark': isDarkHeader }" >
    <div class="main-header__container">
      <div class="main-header__logo">
        <RouterLink to="/">
        <template v-if="!isDarkHeader">
          <img
            class="main-header__logo-reduced"
            src="../images/LogoReducido.png"
            alt="Wanda Logo"
          />
          <img
            class="main-header__logo-principal"
            src="../images/LogoPrincipal.png"
            alt="Wanda Logo"
          />
          </template>
          <template v-else>
            <img class="main-header__logo-reduced" src="../images/OscuroReducido.png" alt="Wanda Logo" />
            <img class="main-header__logo-principal" src="../images/OscuroPrincipal.png" alt="Wanda Logo" />
          </template>
        </RouterLink>
      </div>

      <nav class="main-header__nav">
        <button
          class="nav-toggle"
          :class="{ open: NavBtnStatus }"
          @click="changeStatus"
          aria-label="Abrir menú"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <ul class="nav-list" :class="{ active: NavBtnStatus }">
          <li><RouterLink to="/services">Servicios</RouterLink></li>
          <li><a href="#Sobre Nosotros">Sobre Nosotros</a></li>
          <li><RouterLink to="/contact">Contacto</RouterLink></li>
          <li class="push-right"><RouterLink to="/login">Inicio Sesión</RouterLink></li>
          <li><RouterLink to="/register" class="btn-highlight">Registro</RouterLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
