<script setup lang="ts">

import HeroServiceComponent from '@/components/ServicesView/HeroServiceComponent.vue';
import EnterpriseHeader from '../components/EnterpriseHeader.vue';
import FeaturesComponent from '@/components/ServicesView/FeaturesComponent.vue';
import InfoGridComponent from '@/components/ServicesView/InfoGridComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';

</script>

<template>
<body class="page-services">
    <header>
      <EnterpriseHeader />
    </header>    
    
    <main>
      <HeroServiceComponent></HeroServiceComponent>
      <FeaturesComponent></FeaturesComponent>
      <InfoGridComponent></InfoGridComponent>
    </main>
    <footer class="footer footerDesktop">
      <FooterComponent></FooterComponent>
    </footer>
</body>


</template>