<script setup lang="ts">
import { ref } from 'vue'
const NavBtnStatus = ref(false)
function changeStatus() {
  NavBtnStatus.value = !NavBtnStatus.value
}
</script>
<template>
  <img src="../images/Welcome.png" />
  <h1>¡ Bienvenido !</h1>
  <h2>Nos encanta tenererte aqui</h2>
</template>
