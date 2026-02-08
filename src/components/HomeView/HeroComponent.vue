<script setup lang="ts">

</script>

<template>

    <section class="hero" id="hero">
      <div class="hero__title">
        <h1 class="hero__title-principal">
          Tu economía personal más clara que nunca
        </h1>
        <h3 class="hero__title-secondary">
          WANDA te ayuda a controlar tus gastos, planificar tus ahorros y
          mejorar tu bienestar financiero sin complicaciones
        </h3>
      </div>

      <div class="hero__card">
        <div class="hero__card--right">
          <h2 class="hero__card-subtitle">
            
            Tus objetivos de ahorro, más cerca cada día.
          </h2><RouterLink to="/services">
          <a href="../services.html"><img class="hero__card-img" src="../../images/Card2.png" alt="Tarjeta 1" /></a></RouterLink>
        </div>

        <div class="hero__card--left">
          <h2 class="hero__card-subtitile">
            Porque ahorrar juntos es más fácil.
          </h2><RouterLink to="/services">
          <a href="./services.html"><img class="hero__card-img" src="../../images/Card1.png" alt="Tarjeta 2" /></a></RouterLink>
        </div>
      </div>

      <div class="hero__bt">
        <button><RouterLink to="/register"><a href="./signUp.html">Empieza</a></RouterLink></button>
      </div>
    </section>
</template>