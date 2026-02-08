<script setup lang="ts">
import ContactComponent from '@/components/ContactView/ContactComponent.vue';
import EnterpriseHeader from '@/components/EnterpriseHeader.vue';
import FooterComponent from '@/components/FooterComponent.vue';

</script>

<template>

    <body class="page-contact">
        <header>
        <EnterpriseHeader></EnterpriseHeader>
        </header>
        <main>
        <ContactComponent></ContactComponent>
        </main>
        <footer class="footer footerDesktop">
        <FooterComponent></FooterComponent>
        </footer>
    </body>
</template>