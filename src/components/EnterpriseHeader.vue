<script setup lang="ts">
import { ref } from 'vue'
const NavBtnStatus = ref(false)
function changeStatus() {
  NavBtnStatus.value = !NavBtnStatus.value
}
</script>

<template>
  <header class="main-header">
    <div class="main-header__container">
      <div class="main-header__logo">
        <RouterLink to="/">
        <a href="./index.html">
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
        </a></RouterLink>
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
          <li><a href="./services.html">Servicios</a></li>
          <li><a href="#Sobre Nosotros">Sobre Nosotros</a></li>
          <li><a href="./contact.html">Contacto</a></li>
          <li class="push-right"><RouterLink to="/login"><a href="#InicioSesión">Inicio Sesión</a></RouterLink></li>
          <li><RouterLink to="/register"><a href="#Registro" class="btn-highlight">Registro</a></RouterLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
