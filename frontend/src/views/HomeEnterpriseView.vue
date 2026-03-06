<script setup lang="ts">
import BenefitsComponent from '@/components/HomeView/BenefitsComponent.vue';
import EnterpriseHeader from '@/components/EnterpriseHeader.vue';
import HeroComponent from '@/components/HomeView/HeroComponent.vue';
import AspirationalComponent from '@/components/HomeView/AspirationalComponent.vue';
import QuestionsComponent from '@/components/HomeView/QuestionsComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';

</script>

<template>
  <header>
    <EnterpriseHeader />

  </header>
  <main class="main-container">
    
    <HeroComponent></HeroComponent>
    <BenefitsComponent></BenefitsComponent>
    <AspirationalComponent></AspirationalComponent>
    <QuestionsComponent></QuestionsComponent>
  </main>

  <footer class="footer footerDesktop">
    <FooterComponent></FooterComponent>
  </footer>
</template>
