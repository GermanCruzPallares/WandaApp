<script setup lang="ts"></script>
<template>
  <header class="main-header">
    <div class="main-header__container">
      <div class="main-header__logo">
        <a href="./index.html">
          <img
            class="main-header__logo-reduced"
            src="./images/OscuroReducido.png"
            alt="Wanda Logo"
          />
          <img
            class="main-header__logo-principal"
            src="./images/OscuroPrincipal.png"
            alt="Wanda Logo"
          />
        </a>
      </div>

      <nav class="main-header__nav">
        <button class="nav-toggle" aria-label="Abrir menú">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <ul class="nav-list">
          <li><a href="./services.html">Servicios</a></li>
          <li><a href="#Sobre Nosotros">Sobre Nosotros</a></li>
          <li><a href="./contact.html">Contacto</a></li>
          <li class="push-right"><a href="#InicioSesión">Inicio Sesión</a></li>
          <li><a href="#Registro" class="btn-highlight">Registro</a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import '../styles/main.scss';
</style>
